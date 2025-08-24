import React, { useEffect, useState, useContext } from 'react';
import './ExploreMenu.css';
import axios from 'axios';
import { FiChevronRight, FiX, FiShoppingCart } from 'react-icons/fi';
import { StoreContext } from '../context/StoreContext';
import ProductDetails from '../ProductDetail/ProductDetails';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Globalapi from '../../utils/Globalapi';

const ExploreMenu = () => {
  const { food_list, addToCart, cartItems, highlightProductId } = useContext(StoreContext);
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${Globalapi.CATEGORY_ALL}`);
        if (res.data.success) {
          setMenuList(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Highlight product when coming from search
    if (highlightProductId) {
      const element = document.getElementById(`product-${highlightProductId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-product');
        
        setTimeout(() => {
          element.classList.remove('highlight-product');
        }, 2000);
      }
    }
  }, [highlightProductId]);

  const getItems = (categoryId, subcategoryId = null) => {
    return food_list.filter(item => {
      const getId = (obj) => obj?._id || obj;
      const matchesCategory = getId(item.category) === getId(categoryId);
      if (!subcategoryId) return matchesCategory && !item.subcategory;
      return matchesCategory && getId(item.subcategory) === getId(subcategoryId);
    });
  };

  const openCategoryModal = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setIsModalOpen(true);
  };

  const openSubcategoryModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsModalOpen(true);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="menu-container" id="explore-menu">
      <div className="menu-header">
        <h1 className="menu-title">Our Product Category</h1>
        <p className="menu-subtitle">Discover our premium offerings</p>
      </div>

      <div className="menu-categories-grid">
        {menuList.map((category) => (
          <div 
            key={category._id} 
            className="category-card"
            onClick={() => openCategoryModal(category)}
          >
            <div className="category-card-image">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <h3>{category.name}</h3>
                <p>{getItems(category._id).length} items</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>
              <FiX size={24} />
            </button>
            
            <div className="modal-header">
              <img 
                src={selectedCategory.image} 
                alt={selectedCategory.name} 
                className="modal-category-image"
              />
              <div>
                <h2>{selectedCategory.name}</h2>
                {/* <p>{getItems(selectedCategory._id).length} items available</p> */}
              </div>
            </div>

            <div className="modal-body-scrollable">
              {/* Main category items */}
              {getItems(selectedCategory._id).length > 0 && (
                <div className="modal-section">
                  <h3>Main Items</h3>
                  <div className="modal-products-grid">
                    {getItems(selectedCategory._id).map(item => (
                      <ProductCard 
                        key={item._id} 
                        item={item} 
                        cartItems={cartItems}
                        onClick={() => openProductModal(item)}
                        onAddToCart={handleAddToCart}
                        highlightId={highlightProductId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {selectedCategory.subcategories?.length > 0 && (
                <div className="modal-section">
                  <h3>Subcategories</h3>
                  <div className="subcategories-grid">
                    {selectedCategory.subcategories.map(subcategory => (
                      <div 
                        key={subcategory._id} 
                        className="subcategory-card"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSubcategoryModal(subcategory);
                        }}
                      >
                        <h4>{subcategory.name}</h4>
                        <p>{getItems(selectedCategory._id, subcategory._id).length} items</p>
                        <FiChevronRight className="subcategory-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isModalOpen && selectedSubcategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>
              <FiX size={24} />
            </button>
            
            <div className="modal-header">
              <div className="modal-header-content">
                <h2>{selectedSubcategory.name}</h2>
                <p className="items-count">{getItems(selectedCategory._id, selectedSubcategory._id).length} items available</p>
              </div>
            </div>

            <div className="modal-body-scrollable">
              <div className="modal-products-grid">
                {getItems(selectedCategory._id, selectedSubcategory._id).map(item => (
                  <ProductCard 
                    key={item._id} 
                    item={item} 
                    cartItems={cartItems}
                    onClick={() => openProductModal(item)}
                    onAddToCart={handleAddToCart}
                    highlightId={highlightProductId}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {isProductModalOpen && selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <button className="modal-close-btn" onClick={closeProductModal}>
              <FiX size={24} />
            </button>
            <ProductDetails 
              product={selectedProduct} 
              onAddToCart={handleAddToCart}
              onClose={closeProductModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ item, cartItems, onClick, onAddToCart, highlightId }) => {
  const quantity = cartItems[item._id] || 0;
  const isHighlighted = highlightId === item._id;

  // Add this useEffect for highlighting
  useEffect(() => {
    if (highlightId === item._id) {
      const element = document.getElementById(`product-${item._id}`);
      if (element) {
        element.classList.add('highlight-product');
        setTimeout(() => {
          element.classList.remove('highlight-product');
        }, 2000);
      }
    }
  }, [highlightId, item._id]);

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(item._id, 1, item);
  };

  return (
    <div 
      id={`product-${item._id}`}
      className={`product-card ${isHighlighted ? 'highlight-product' : ''}`}
      onClick={onClick}
    >
      <div className="product-image-wrapper">
        <img src={item.image} alt={item.name} className="product-image" />
        {quantity > 0 && (
          <div className="product-quantity-badge">{quantity} in cart</div>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-price">₹{item.price}</p>
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCartClick}
        >
          <FiShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ExploreMenu;