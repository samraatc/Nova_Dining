import React, { useContext, useEffect, useMemo, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart, setToken } = useContext(StoreContext);
  
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "India",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' | 'dinein'
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();

  // Calculate shipping per product based on quantity
  const calculateShippingForProduct = (quantity) => {
    return 550 + (quantity - 1) * 55;
  };

  // Calculate total shipping for all items
  const totalShipping = useMemo(() => {
    if (deliveryMethod === 'dinein') return 0;
    let total = 0;
    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      total += calculateShippingForProduct(qty);
    }
    return total;
  }, [cartItems, deliveryMethod]);

  // Calculate total amount including shipping
  const totalAmount = useMemo(() => {
    return getTotalCartAmount() + totalShipping;
  }, [getTotalCartAmount, totalShipping]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validate based on delivery method
      if (deliveryMethod === 'delivery') {
        if (!/^\d{10}$/.test(data.phone)) {
          throw new Error('Please enter a valid 10-digit phone number');
        }
      } else {
        if (!tableNumber.trim()) {
          throw new Error('Please enter your table number for dine-in booking');
        }
      }

      // Check if order has too many items
      const itemCount = Object.keys(cartItems).length;
      if (itemCount > 50) {
        throw new Error('Too many items in cart. Please reduce to 50 items or less.');
      }

      // Prepare order items
      const orderItems = food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          shippingCharge: calculateShippingForProduct(cartItems[item._id])
        }));

      const orderData = {
        address: data,
        items: orderItems,
        amount: getTotalCartAmount(),
        shippingCharge: totalShipping,
        totalAmount: totalAmount,
        deliveryMethod,
        tableNumber: deliveryMethod === 'dinein' ? tableNumber : undefined
      };

      console.log('Order data size:', JSON.stringify(orderData).length);
      console.log('Number of items:', orderItems.length);
      console.log('Environment:', window.location.hostname);
      console.log('Token length:', token ? token.length : 0);
      console.log('Request URL:', `${url}/api/order/place`);
   

      // Step 1: Create order on backend
      let orderResponse;
      
      // For deployed environment, use minimal headers
      const isDeployed = window.location.hostname !== 'localhost';
      const requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Remove unnecessary headers for deployed environment
      if (isDeployed) {
        console.log('Using minimal headers for deployed environment');
        // Add compression header for deployed environment
        requestHeaders['Accept-Encoding'] = 'gzip, deflate';
        // Remove any potential large headers
        delete requestHeaders['User-Agent'];
        delete requestHeaders['Referer'];
      }
      
      try {
        orderResponse = await axios.post(`${url}/api/order/place`, orderData, {
          headers: requestHeaders,
          timeout: 30000 // 30 seconds timeout
        });
              } catch (error) {
          if (error.response?.status === 431) {
            // If headers are too large, try with minimal data
            console.log('Headers too large, trying with minimal data...');
            const minimalOrderData = {
              address: data,
              items: orderItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              })),
              amount: getTotalCartAmount(),
              shippingCharge: totalShipping,
              totalAmount: totalAmount,
              deliveryMethod,
              tableNumber: deliveryMethod === 'dinein' ? tableNumber : undefined
            };
            
            try {
              orderResponse = await axios.post(`${url}/api/order/place`, minimalOrderData, {
                headers: requestHeaders
              });
            } catch (secondError) {
              if (secondError.response?.status === 431) {
                // If still too large, try with even more minimal data
                console.log('Still too large, trying with product IDs only...');
                const ultraMinimalOrderData = {
                  address: data,
                  items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                  })),
                  amount: getTotalCartAmount(),
                  shippingCharge: totalShipping,
                  totalAmount: totalAmount,
                  deliveryMethod,
                  tableNumber: deliveryMethod === 'dinein' ? tableNumber : undefined
                };
                
                orderResponse = await axios.post(`${url}/api/order/place`, ultraMinimalOrderData, {
                  headers: requestHeaders
                });
              } else {
                throw secondError;
              }
            }
          } else {
            throw error;
          }
        }

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const { orderId, razorpayOrderId, amount, key } = orderResponse.data;

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page.');
      }

      // Step 3: Initialize Razorpay payment
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: "INR",
        name: "Fortune India",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function(response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(`${url}/api/order/verify`, {
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            }, { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Order placed.');
              clearCart();
              navigate('/order-success', { state: { orderId } });
            } else {
              toast.error(verifyResponse.data.message || 'Payment verification failed');
              navigate('/order-failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
              setToken('');
              navigate('/login');
              toast.error('Session expired. Please login again.');
            } else {
              toast.error('Error verifying payment. Please contact support.');
              navigate('/order-failed');
            }
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone
        },
        notes: {
          address: `${data.street}, ${data.city}, ${data.state} - ${data.zipcode}`
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment window closed. Your order is still pending.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function(response) {
        toast.error(`Payment failed: ${response.error.description}`);
        console.error(response.error);
      });

    } catch (error) {
      console.error('Order error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 413) {
        toast.error('Order data too large. Please reduce the number of items or contact support.');
      } else if (error.response?.status === 431) {
        toast.error('Request headers too large. Please try again or contact support.');
      } else if (error.response?.status === 0) {
        toast.error('Connection failed. Please check if the server is running.');
      } else {
        toast.error(error.message || 'Failed to process order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <>
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="delivery-toggle">
          <button
            type="button"
            className={`delivery-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('delivery')}
          >
            🏠 Home Delivery
          </button>
          <button
            type="button"
            className={`delivery-btn ${deliveryMethod === 'dinein' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('dinein')}
          >
            🍽️ Book Table
          </button>
        </div>
        {deliveryMethod === 'dinein' && (
          <input 
            required 
            name='tableNumber' 
            onChange={(e) => setTableNumber(e.target.value)} 
            value={tableNumber} 
            type="text" 
            placeholder='Table Number'
          />
        )}
        <div className="multi-fields">
          <input 
            required 
            name='firstName' 
            onChange={onChangeHandler} 
            value={data.firstName} 
            type="text" 
            placeholder='First Name'
          />
          <input 
            required 
            name='lastName' 
            onChange={onChangeHandler} 
            value={data.lastName} 
            type="text" 
            placeholder='Last Name'
          />
        </div>
        <input 
          required 
          name='email' 
          onChange={onChangeHandler} 
          value={data.email} 
          type="email" 
          placeholder='Email address'
        />
        {deliveryMethod === 'delivery' && (
          <input 
            required 
            name='street' 
            onChange={onChangeHandler} 
            value={data.street} 
            type="text" 
            placeholder='Street'
          />
        )}
        <div className="multi-fields">
          {deliveryMethod === 'delivery' && (
            <>
              <input 
                required 
                name='city' 
                onChange={onChangeHandler} 
                value={data.city} 
                type="text" 
                placeholder='City'
              />
              <input 
                required 
                name='state' 
                onChange={onChangeHandler} 
                value={data.state} 
                type="text" 
                placeholder='State'
              />
            </>
          )}
        </div>
        <div className="multi-fields">
          {deliveryMethod === 'delivery' && (
            <>
              <input 
                required 
                name='zipcode' 
                onChange={onChangeHandler} 
                value={data.zipcode} 
                type="text" 
                placeholder='Zip code'
                pattern="[0-9]{6}"
                title="6-digit zip code"
              />
              <input 
                required 
                name='country' 
                onChange={onChangeHandler} 
                value={data.country} 
                type="text" 
                placeholder='Country' 
                readOnly 
              />
            </>
          )}
        </div>
        <input 
          required={deliveryMethod === 'delivery'} 
          name='phone' 
          onChange={onChangeHandler} 
          value={data.phone} 
          type="tel" 
          placeholder='Phone' 
          pattern={deliveryMethod === 'delivery' ? "[0-9]{10}" : undefined}
          title={deliveryMethod === 'delivery' ? "10-digit phone number" : undefined}
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount().toLocaleString('en-IN')}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Shipping & Packaging</p>
              <p>{deliveryMethod === 'dinein' ? '— (Dine-in)' : `₹${totalShipping.toLocaleString('en-IN')}`}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total Amount</b>
              <b>₹{totalAmount.toLocaleString('en-IN')}</b>
            </div>
          </div>
          <div className="shipping-notice">
            {deliveryMethod === 'delivery' ? (
              <p>Shipping calculation: ₹550 base + ₹55 per additional item</p>
            ) : (
              <p>Dine-in booking selected. No shipping applied.</p>
            )}
          </div>
          <button 
            type='submit' 
            className='payment-btn' 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              'PROCEED TO PAYMENT'
            )}
          </button>
        </div>
        
      </div>
     
      
    </form>
     <div>
        For Outside INDIA order , please Contact us
      </div>
      </>
  );
};

export default PlaceOrder;