import React, { useContext, useMemo } from 'react';
import './Cart.css';
import { StoreContext } from '../../components/context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  // ✅ Corrected shipping calculation per product
  const calculateShippingForProduct = (quantity) => {
    return 550 + (quantity - 1) * 55;
  };

  // Calculate total shipping for all items
  const getTotalShipping = useMemo(() => {
    let totalShipping = 0;
    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      totalShipping += calculateShippingForProduct(qty);
    }
    return totalShipping;
  }, [cartItems]);

  // Calculate total amount including shipping
  const getTotalWithShipping = useMemo(() => {
    return getTotalCartAmount() + getTotalShipping;
  }, [getTotalCartAmount, getTotalShipping]);

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Shipping</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            const productShipping = calculateShippingForProduct(cartItems[item._id]);
            
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + '/images/' + item.image}  />
                  <p>{item.name}</p>
                  <p>₹{item.price.toLocaleString()}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{(item.price * cartItems[item._id]).toLocaleString()}</p>
                  <p>₹{productShipping.toLocaleString()}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            )
          }
          return null;
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount().toLocaleString()}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Shipping & Packaging</p>
              <p>₹{getTotalShipping.toLocaleString()}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>₹{getTotalWithShipping.toLocaleString()}</b>
            </div> 
          </div>
          <button 
            onClick={() => navigate('/order')}
            disabled={getTotalCartAmount() === 0}
            className={getTotalCartAmount() === 0 ? 'disabled-btn' : ''}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        {/* <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='Promo Code' />
              <button>Submit</button>
            </div>
          </div>
        </div> */}
      </div>
      
      {/* Price Breakdown Section */}
      {/* <div className="cart-price-breakdown">
        <h3>Price Breakdown</h3>
        <div className="breakdown-details">
          <div className="breakdown-row">
            <span>Product Price:</span>
            <span>₹{getTotalCartAmount().toLocaleString()}</span>
          </div>
          <div className="breakdown-row">
            <span>Shipping & Packaging:</span>
            <span>₹{getTotalShipping.toLocaleString()}</span>
          </div>
          <div className="breakdown-row total-row">
            <span><b>Total:</b></span>
            <span><b>₹{getTotalWithShipping.toLocaleString()}</b></span>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default Cart;
