import React, { useState } from 'react';
import './ContactUs.css';

import Globalapi from '../utils/Globalapi';

const ContactusForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Added phone field
    subject: '',
    message: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${Globalapi.CONTACT_SUBMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: data.message
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '', // Reset phone field
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to submit form');
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error.message || 'An error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({
          success: false,
          message: ''
        });
      }, 5000);
    }
  };

  return (
    <section className="contact-section" id="contact-us">
      <h2 className="section-title">Get in Touch</h2>
      <div className="contact-form-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Added Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="optional-text">(optional)</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="(123) 456-7890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="Subject of your message"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Write your message here..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
          
          {submitStatus.message && (
            <div className={`submit-feedback ${submitStatus.success ? 'success' : 'error'}`}>
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactusForm;