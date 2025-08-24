import React, { useContext, useEffect, useRef, useCallback } from 'react';
import './SearchPopup.css';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch } from 'react-icons/fi';

const SearchPopup = ({ isOpen, onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchProducts,
    setShowSearchResults,
    setHighlightProductId,
    isSearching
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search to avoid too many calls
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(query);
    }, 300);
  };

  // Debug: Log search results structure
  useEffect(() => {
    if (searchResults.length > 0) {
      console.log('Search results structure:', searchResults[0]);
    }
  }, [searchResults]);

  const handleResultClick = (product) => {
    setSearchQuery('');
    setShowSearchResults(false);
    onClose();
    
    // Navigate to product details page
    navigate(`/product/${product._id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-popup-overlay" onClick={onClose}>
      <div className="search-popup" onClick={(e) => e.stopPropagation()}>
        <div className="search-popup-header">
          <h2>Search Products</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products..."
            value={searchQuery || ''}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
        </div>

        <div className="search-results">
          {isSearching && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          )}
          
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="no-results">
              <p>No products found for "{searchQuery}"</p>
            </div>
          )}
          
          {searchResults.map(product => (
            <div 
              key={product._id} 
              className="search-result-item"
              onClick={() => handleResultClick(product)}
            >
              <img src={product.image} alt={product.name || 'Product'} />
              <div className="result-details">
                <h3>{product.name || 'Unnamed Product'}</h3>
                <p className="result-category">
                  {typeof product.category === 'object' ? product.category.name : (product.category || 'No Category')}
                </p>
                <p className="result-price">₹{product.price || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup; 