import React, { useState } from 'react'
import './Navbar.css'
import { assets } from './../../assets/assets';
import logo from '../../assets/logo1.png'
import { toast } from 'react-toastify';

const Navbar = ({ setIsAuthenticated }) => {
  const [adminData, setAdminData] = useState(() => {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  });

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Call logout API
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Update authentication state
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setIsAuthenticated(false);
    }
  };

  return (
    <div className='navbar'>
      <div className="navbar-content">
        <div className="navbar-brand">
          <img className='navbar-logo' src={logo} alt="Nova Dining" />
          <span className="navbar-title">Nova Dining</span>
        </div>
        <div className="navbar-actions">
          {adminData && (
            <div className="admin-info">
              <span className="admin-name">
                {adminData.name} {adminData.isDemo && '(Demo)'}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar