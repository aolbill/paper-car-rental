import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🚗 RentKenya</h4>
            <p>Premium car rentals for your Kenyan adventure. From city drives to safari expeditions across beautiful Kenya.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cars">Our Cars</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#economy">Economy Cars</a></li>
              <li><a href="#luxury">Luxury Vehicles</a></li>
              <li><a href="#safari">Safari Packages</a></li>
              <li><a href="#airport">Airport Transfers</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul>
              <li>📞 +254 700 000 000</li>
              <li>📧 info@rentkenya.com</li>
              <li>📍 Westlands, Nairobi</li>
              <li>🕒 24/7 Service</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Popular Locations</h4>
            <ul>
              <li>JKIA Airport</li>
              <li>Nairobi CBD</li>
              <li>Mombasa</li>
              <li>Maasai Mara</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 RentKenya. All rights reserved. | Made with ❤️ in Kenya</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
