import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';
import { assets } from './../../assets/assets';
import Globalapi from '../../utils/Globalapi';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(
        Globalapi.USER_ORDERS,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setData(response.data.data);
    } catch (error) {
      console.error('Order fetch error:', error);
      setError('Failed to load orders. Please try again.');
      if (error.response?.status === 401) {
        console.error('Authentication error - invalid or expired token');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setError('Authentication required. Please login.');
      setLoading(false);
    }
  }, [token]);

  // Calculate total amount safely
  const calculateTotal = (order) => {
    if (order.totalAmount !== undefined) {
      return order.totalAmount;
    }
    return (order.amount || 0) + (order.shippingCharge || 550);
  };

  // Cancel order function with 5% cancellation fee
  const handleCancelOrder = async (orderId) => {
    // Find the order to cancel
    const orderToCancel = data.find(order => order._id === orderId);
    if (!orderToCancel) return;
    
    // Calculate totals and fees
    const total = calculateTotal(orderToCancel);
    const cancellationFee = total * 0.05; // 5% fee
    const refundAmount = total - cancellationFee;
    
    // Confirmation message with fee details
    const confirmationMessage = 
      `Are you sure you want to cancel this order?\n\n` +
      `• Total amount: ₹${total.toFixed(2)}\n` +
      `• Cancellation fee (5%): ₹${cancellationFee.toFixed(2)}\n` +
      `• Refund amount: ₹${refundAmount.toFixed(2)}\n\n` +
      `This amount will be credited to your original payment method.`;
    
    if (!window.confirm(confirmationMessage)) return;
    
    try {
      setCancellingOrderId(orderId);
      const response = await axios.post(
        url + '/api/order/cancel',
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update local state with cancellation details
        setData(prev => prev.map(order => 
          order._id === orderId ? {
            ...order, 
            status: "Cancelled",
            refundAmount: response.data.refundAmount || refundAmount,
            cancellationFee: response.data.cancellationFee || cancellationFee,
            refundId: response.data.refundId
          } : order
        ));
        alert(`Order cancelled successfully!\n₹${refundAmount.toFixed(2)} will be refunded to your account.`);
      } else {
        alert(`Cancellation failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert(`Cancellation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      
      {loading && <div className="loader">Loading orders...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="container">
          {data.length === 0 ? (
            <div className="no-orders">
              <img src={assets.order_history} alt="No orders" />
              <h3>You haven't placed any orders yet</h3>
            </div>
          ) : (
            data.map((order, index) => {
              const total = calculateTotal(order);
              const isCancellable = !["Cancelled", "Delivered", "Out for Delivery"].includes(order.status);
              const isCancelled = order.status === "Cancelled";
              
              return (
                <div key={order._id || index} className="my-orders-order">
                  <img src={assets.parcel_icon} alt="Delivery" />
                  <p>
                    {order.items.map((item, idx) => (
                      <span key={item._id || idx}>
                        {item.name} × {item.quantity}
                        {idx !== order.items.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                  <p>Total: ₹{total.toFixed(2)}</p>
                  
                  {isCancelled && (
                    <>
                      {order.cancellationFee > 0 && (
                        <p className="fee-info">
                          Cancellation Fee: ₹{order.cancellationFee.toFixed(2)}
                        </p>
                      )}
                      {order.refundAmount > 0 && (
                        <p className="refund-info">
                          Refunded: ₹{order.refundAmount.toFixed(2)}
                          {order.refundId && ` (ID: ${order.refundId.slice(-6)})`}
                        </p>
                      )}
                    </>
                  )}
                  
                  <p>Items: {order.items.length}</p>
                  <p>
                    <span className={`status-indicator ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      &#x25cf;
                    </span>
                    <b>{order.status}</b>
                  </p>
                  
                  {/* Cancel button with conditional rendering */}
                  {isCancellable && (
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingOrderId === order._id}
                    >
                      {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default MyOrders