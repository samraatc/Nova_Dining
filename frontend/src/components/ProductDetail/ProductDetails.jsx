import React, { useState } from 'react';
import './ProductDetails.css';
import { FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetails = ({
  product: {
    _id = '',
    name = '',
    code = '',
    price = 0,
    description = '',
    image = '',
    images = [],
  } = {},
  onAddToCart = () => {},
  onClose = () => {},
}) => {
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(image);
  const [loading, setLoading] = useState(false);

  const calculateShippingCharge = (qty) => 550 + (qty - 1) * 55;

  // Pre-calculate to avoid repeating
  const shippingCharge = calculateShippingCharge(quantity);
  const totalPrice = (price * quantity) + shippingCharge;

  const handleQuantity = (e) => {
    const val = Math.max(1, Number(e.target.value) || 1);
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await onAddToCart(_id, quantity, {
        name,
        code,
        price,
        shippingCharge,
        totalPrice,
        image,
      });

      toast.success(
        `${quantity} ${name} added to cart (₹${shippingCharge} shipping)!`,
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add item to cart', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const allImages = [image, ...images].filter(Boolean);

  return (
    <section className="product-details">
      <div className="pd-container">
        {/* Images */}
        <div className="pd-images">
          <img
            src={mainImage || '/fallback.png'}
            alt={name || 'Product image'}
            className="pd-main-img"
            onError={(e) => (e.target.src = '/fallback.png')}
          />

          {allImages.length > 1 && (
            <div className="pd-thumb-list">
              {allImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${name} image option ${i + 1}`}
                  onClick={() => setMainImage(src)}
                  className={mainImage === src ? 'selected-thumb' : ''}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="pd-info">
          <h1 className="pd-name">{name}</h1>
          {code && (
            <p className="pd-code">
              Product Code: <strong>{code}</strong>
            </p>
          )}

          <p className="pd-price">
            ₹{price.toLocaleString()} <span className="pd-small">Inc GST</span>
          </p>

          {/* Buy Section */}
          <div className="pd-buy-section">
            <div className="pd-quantity-control">
              <label htmlFor="qty">Qty:</label>
              <input
                type="number"
                id="qty"
                min="1"
                value={quantity}
                onChange={handleQuantity}
                onBlur={() => !quantity && setQuantity(1)}
                className="pd-quantity-input"
              />
            </div>
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={loading}
              aria-label={`Add ${name} to cart`}
            >
              {loading ? 'Adding...' : <><FiShoppingCart size={16} /> Add to Cart</>}
            </button>
          </div>

          {/* Description */}
          {description && (
            <div className="pd-description">
              <h3 className="pd-desc">Description</h3>
              <p>{description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="pd-details-grid">
            <div className="pd-shipping-info">
              <h3 className="pd-section-title">Shipping & Packaging</h3>
              <p>Shipping: ₹{shippingCharge}</p>
              <p className="pd-shipping-note">
                ₹550 base + ₹55 per additional item
              </p>
            </div>

            <div className="pd-price-breakdown">
              <h3 className="pd-section-title">Price Breakdown</h3>
              <div className="pd-price-row">
                <span>Product Price:</span>
                <span>₹{(price * quantity).toLocaleString()}</span>
              </div>
              <div className="pd-price-row">
                <span>Shipping & Packaging:</span>
                <span>₹{shippingCharge}</span>
              </div>
              <div className="pd-price-row pd-price-total">
                <span>Total:</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <p className="pd-international">
                For Outside INDIA orders, please Contact us
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
