import React from 'react'
import './Navbar.css'
import { assets } from './../../assets/assets';
import logo from '../../assets/logo1.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="navbar-content">
        <div className="navbar-brand">
          <img className='navbar-logo' src={logo} alt="Nova Dining" />
          <span className="navbar-title">Nova Dining</span>
        </div>
        <div className="navbar-actions">
          {/* Add any navbar actions here if needed */}
        </div>
      </div>
    </div>
  )
}

export default Navbar