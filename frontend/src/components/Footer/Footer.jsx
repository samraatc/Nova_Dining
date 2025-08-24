import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import logo from "../../assets/logo1.png";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img className="footer-logo" src={logo} alt="" />
          <p>
            Your Most Trusted Brand for High-Quality, Durable & Precision
            Printing Solutions - Transforming Your Vision into Reality.
          </p>
          <p>Address: 221, New Road, Kathmandu, Bagmati Province, Nepal</p>

          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91 1234567890</li>
            <li>novadining@gmail.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025 &copy; Nova Dining - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
