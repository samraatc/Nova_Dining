import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import Globalapi from '../../utils/Globalapi';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [food_list, setFoodList] = useState([]);
    const [highlightProductId, setHighlightProductId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const url = "https://api.fortune-india.co.in";

    // Create axios instance
    const api = axios.create({
        baseURL: url,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Add token to every request automatically
    api.interceptors.request.use(config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const addToCart = async (itemId, quantity = 1) => {
        const updatedCart = { ...cartItems };
        
        updatedCart[itemId] = (updatedCart[itemId] || 0) + quantity;
        
        setCartItems(updatedCart);

        if (token) {
            try {
                await api.post(`${Globalapi.CART_ADD}`, { itemId, quantity });
            } catch (error) {
                console.error("Error adding to cart:", error);
                setCartItems(prev => {
                    const reverted = { ...prev };
                    if (reverted[itemId] > quantity) {
                        reverted[itemId] -= quantity;
                    } else {
                        delete reverted[itemId];
                    }
                    return reverted;
                });
            }
        }
    };

    const removeFromCart = async (itemId) => {
        const updatedCart = { ...cartItems };
        if (updatedCart[itemId] > 1) {
            updatedCart[itemId] -= 1;
        } else {
            delete updatedCart[itemId];
        }
        setCartItems(updatedCart);

        if (token) {
            try {
                await api.post(`${Globalapi.CART_REMOVE}`, { itemId });
            } catch (error) {
                console.error("Error removing from cart:", error);
                setCartItems(prev => ({
                    ...prev,
                    [itemId]: (prev[itemId] || 0) + 1
                }));
            }
        }
    };

    const getTotalCartAmount = () => {
        return food_list.reduce((total, product) => {
            const quantity = cartItems[product._id] || 0;
            return total + (product.price * quantity);
        }, 0);
    };

    const fetchFoodList = async () => {
        try {
            const response = await api.get(`${Globalapi.FOOD_LIST}`);
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Failed to fetch food list:", error);
        }
    };

    const loadCartData = async () => {
        try {
            const response = await api.post(`${Globalapi.CART_GET}`, {});
            setCartItems(response.data.cartData || {});
        } catch (error) {
            console.error("Failed to load cart data:", error);
            setCartItems({});
        }
    };

    // Handle expired tokens
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setToken('');
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        fetchFoodList();
        const guestCartRaw = localStorage.getItem('guest_cart');
        if (!token && guestCartRaw) {
            try {
                const guestCart = JSON.parse(guestCartRaw) || {};
                setCartItems(guestCart);
            } catch (e) {
                console.error('Failed to parse guest cart');
            }
        }
        if (token) {
            const mergeGuestCart = async () => {
                try {
                    const guestCartRawLocal = localStorage.getItem('guest_cart');
                    if (guestCartRawLocal) {
                        const guestCart = JSON.parse(guestCartRawLocal) || {};
                        const entries = Object.entries(guestCart);
                        if (entries.length > 0) {
                            for (const [itemId, quantity] of entries) {
                                if (quantity > 0) {
                                    await api.post(`${Globalapi.CART_ADD}`, { itemId, quantity });
                                }
                            }
                            localStorage.removeItem('guest_cart');
                        }
                    }
                } catch (e) {
                    console.error('Failed to merge guest cart on login', e);
                } finally {
                    loadCartData();
                }
            };
            mergeGuestCart();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // When logged in, keep guest cart cleared to avoid divergence
            localStorage.removeItem('guest_cart');
        } else {
            localStorage.removeItem('token');
            // Persist cart for guests
            try {
                localStorage.setItem('guest_cart', JSON.stringify(cartItems));
            } catch (e) {
                // ignore
            }
        }
    }, [token]);

    // Persist guest cart on changes when not logged in
    useEffect(() => {
        if (!token) {
            try {
                localStorage.setItem('guest_cart', JSON.stringify(cartItems));
            } catch (e) {
                // ignore
            }
        }
    }, [cartItems, token]);

    const clearCart = async () => {
        setCartItems({});
        if (token) {
            try {
                await api.post(`${Globalapi.CART_CLEAR}`);
            } catch (error) {
                console.error("Error clearing cart:", error);
            }
        }
    };

    // Search function
    const searchProducts = (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = food_list.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
    };

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        clearCart,
        highlightProductId,
        setHighlightProductId,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        showSearchResults,
        setShowSearchResults,
        searchProducts
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;