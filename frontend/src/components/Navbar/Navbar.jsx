import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from './../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from './../context/StoreContext';
import logo from "../../assets/logo1.png";
import { FiSearch } from 'react-icons/fi';
import SearchPopup from '../SearchPopup/SearchPopup';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('home');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const { 
    getTotalCartAmount, 
    token, 
    setToken
  } = useContext(StoreContext);
  
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  const openSearchPopup = () => {
    setShowSearchPopup(true);
  };

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchPopup(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='navbar'>
      <div className="navbar-container">
        <Link to='/'><img src={logo} alt="" className='logo' /></Link>
        <ul className="navbar-menu">
          <Link to='/' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>
            Home
          </Link>
          <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>
            Category
          </a>
          <a href='#app-download' onClick={() => setMenu('mobile-app')} className={menu === 'mobile-app' ? 'active' : ''}>
            Featured Products
          </a>
          <a href='#footer' onClick={() => setMenu('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>
            Contact us
          </a>
        </ul>
        <div className="navbar-right">
          <div className="navbar-search">
            <button 
              className="search-button"
              onClick={openSearchPopup}
              type="button"
            >
              <FiSearch />
              <span>Search products...</span>
              <span className="keyboard-shortcut">
                {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
              </span>
            </button>
          </div>
          
          <div className="navbar-search-icon">
            <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
            <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
          </div>
          
          {!token ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
          ) : (
            <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="" />
              <ul className="nav-profile-dropdown">
                <li onClick={() => navigate('/myorders')}>
                  <img src={assets.bag_icon} alt="" /><p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" /><p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <SearchPopup 
        isOpen={showSearchPopup} 
        onClose={() => setShowSearchPopup(false)} 
      />
    </div>
  );
};

export default Navbar;