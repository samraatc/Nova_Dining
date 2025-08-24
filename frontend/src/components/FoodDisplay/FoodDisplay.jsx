import React, { useContext, useEffect, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import axios from 'axios';

const FoodDisplay = ({ category, subcategory }) => {
  const { food_list, cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [filteredFoodList, setFilteredFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validSubcategories, setValidSubcategories] = useState([]);

  // Fetch valid subcategories when category changes
  useEffect(() => {
    const fetchValidSubcategories = async () => {
      if (category && category._id && category._id !== 'All') {
        try {
          const response = await axios.get(`http://localhost:5000/api/subcategory/by-category/${category._id}`);
          setValidSubcategories(response.data.map(sub => sub._id));
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setValidSubcategories([]);
        }
      } else {
        setValidSubcategories([]);
      }
    };
    fetchValidSubcategories();
  }, [category]);

  // Filter products based on category and subcategory
  useEffect(() => {
    if (food_list && food_list.length > 0) {
      setLoading(true);

      const filteredItems = food_list.filter((item) => {
        // Helper function to extract ID regardless of format
        const getId = (obj) => {
          if (!obj) return null;
          return typeof obj === 'object' ? obj._id : obj;
        };

        const itemCategoryId = getId(item.category);
        const itemSubcategoryId = getId(item.subcategory);
        const selectedCategoryId = getId(category);
        const selectedSubcategoryId = getId(subcategory);

        // Case 1: No filters selected
        if ((!category || category === 'All') && (!subcategory || subcategory === 'All')) {
          return true;
        }

        // Case 2: Only category selected
        if (selectedCategoryId && selectedCategoryId !== 'All' && (!subcategory || subcategory === 'All')) {
          return itemCategoryId === selectedCategoryId;
        }

        // Case 3: Both category and subcategory selected
        if (selectedCategoryId && selectedCategoryId !== 'All' && selectedSubcategoryId && selectedSubcategoryId !== 'All') {
          // Verify the subcategory belongs to the selected category
          const isSubcategoryValid = validSubcategories.includes(selectedSubcategoryId);
          return isSubcategoryValid && 
                 itemCategoryId === selectedCategoryId && 
                 itemSubcategoryId === selectedSubcategoryId;
        }

        // Case 4: Only subcategory selected (without category)
        if (selectedSubcategoryId && selectedSubcategoryId !== 'All' && (!category || category === 'All')) {
          // First check if we have valid subcategories loaded
          if (validSubcategories.length > 0) {
            // Only show if the subcategory is valid (belongs to some category)
            return validSubcategories.includes(itemSubcategoryId) && 
                   itemSubcategoryId === selectedSubcategoryId;
          }
          // Fallback if validSubcategories not loaded yet
          return itemSubcategoryId === selectedSubcategoryId;
        }

        return false;
      });

      setFilteredFoodList(filteredItems);
      setLoading(false);
    }
  }, [food_list, category, subcategory, validSubcategories]);

  if (loading) {
    return <div className='food-display'>Loading products...</div>;
  }

  return (
    <div className='food-display' id='food-display'>
      <h2>Our Products</h2>
      {category && category !== 'All' && (
        <h3 className="current-category">
          {category.name || 'Selected Category'}
          {subcategory && subcategory !== 'All' && ` > ${subcategory.name || 'Selected Subcategory'}`}
        </h3>
      )}
      <div className="food-display-list">
        {filteredFoodList.length > 0 ? (
          filteredFoodList.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              cartQuantity={cartItems[item._id] || 0}
              onAddToCart={() => addToCart(item._id)}
              onRemoveFromCart={() => removeFromCart(item._id)}
            />
          ))
        ) : (
          <div className="no-products-found">
            No products found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;