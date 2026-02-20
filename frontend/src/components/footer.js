import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";

import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>Customer Support</h4>
          <p>
            <a
              href="https://wa.me/916382886734"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: +91 8888888888
            </a>
          </p>
          <p>
            <a href="mailto:mmenggservice@gmail.com">
              Email: mmenggservice@gmail.com
            </a>
          </p>
        </div>

        <div className="footer-column">
          <h4>Information</h4>
          <ul>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/whatwedo">What we do</Link></li>
            <li><Link to="/project">Project</Link></li>
            <li><Link to="/contact">Contactus</Link></li>
          </ul>
        </div>


        <div className="footer-column">
          <h4>Our Store</h4>
          <div className="social-icons">
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
            <a href="tel:+1234567890">
              <FaPhone />
            </a>
            <a href="mailto:sanjay140403@gmail.com">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
