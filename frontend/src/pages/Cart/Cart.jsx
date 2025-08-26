import React, { useContext, useMemo } from 'react';
import './Cart.css';
import { StoreContext } from '../../components/context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ setShowLogin }) => {
  const { 
    cartItems, 
    food_list, 
    removeFromCart, 
    getTotalCartAmount, 
    url, 
    token,
    addToCart  // Make sure this function is imported from context
  } = useContext(StoreContext);
  
  const navigate = useNavigate();

  const calculateShippingForProduct = (quantity) => {
    return 550 + (quantity - 1) * 55;
  };

  const getTotalShipping = useMemo(() => {
    let totalShipping = 0;
    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      totalShipping += calculateShippingForProduct(qty);
    }
    return totalShipping;
  }, [cartItems]);

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
          <p>Actions</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            const productShipping = calculateShippingForProduct(cartItems[item._id]);
            
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img 
                    src={url + '/images/' + item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-food.jpg';
                      e.target.onerror = null;
                    }}
                  />
                  <p>{item.name}</p>
                  <p>₹{item.price.toLocaleString()}</p>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn minus" 
                      onClick={() => removeFromCart(item._id)}
                      disabled={cartItems[item._id] <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{cartItems[item._id]}</span>
                    <button 
                      className="quantity-btn plus" 
                      onClick={() => addToCart(item._id, 1)}  // Fixed: Add this onClick handler
                    >
                      +
                    </button>
                  </div>
                  <p>₹{(item.price * cartItems[item._id]).toLocaleString()}</p>
                  <p>₹{productShipping.toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      // Remove all quantity at once
                      const quantity = cartItems[item._id];
                      for(let i = 0; i < quantity; i++) {
                        removeFromCart(item._id);
                      }
                    }} 
                    className='remove-btn'
                    title="Remove item"
                  >
                    🗑️
                  </button>
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
            onClick={() => {
              if (!token) {
                setShowLogin?.(true);
                return;
              }
              navigate('/order');
            }}
            disabled={getTotalCartAmount() === 0}
            className={getTotalCartAmount() === 0 ? 'disabled-btn' : ''}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart;