import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../components/context/StoreContext';
import ProductDetails from '../../components/ProductDetail/ProductDetails';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { food_list, addToCart } = useContext(StoreContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (food_list && food_list.length > 0) {
      const foundProduct = food_list.find(item => item._id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        // Product not found
        toast.error('Product not found', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/');
      }
      setLoading(false);
    }
  }, [productId, food_list, navigate]);

  const handleAddToCart = (itemId, quantity, itemData) => {
    try {
      addToCart(itemId, quantity);
      toast.success(`${quantity} ${itemData.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to add item to cart', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error adding to cart:', error);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <button onClick={handleClose} className="back-button">
          ← Back to Products
        </button>
      </div>
      
      <ProductDetails 
        product={product} 
        onAddToCart={handleAddToCart}
        onClose={handleClose}
      />
    </div>
  );
};

export default ProductDetailsPage; 