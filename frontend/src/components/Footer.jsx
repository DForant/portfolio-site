import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo and Tagline */}
          <div className="footer__brand">
            <img src="/assets/images/Logo Light BG.png" alt="Dean Forant logo" className="footer__logo" />
            <p className="footer__tagline">Brand & web design rooted in strategy.</p>
          </div>
          
          {/* Quick Links */}
          <div className="footer__links">
            <h3 className="footer__title">Quick Links</h3>
            <nav className="footer__nav">
              <ul className="footer__nav-list">
                <li className="footer__nav-item"><Link to="/#home" className="footer__nav-link">Home</Link></li>
                <li className="footer__nav-item"><Link to="/#about" className="footer__nav-link">About</Link></li>
                <li className="footer__nav-item"><Link to="/#services" className="footer__nav-link">Services</Link></li>
                <li className="footer__nav-item"><Link to="/#portfolio-section" className="footer__nav-link">Portfolio</Link></li>
                <li className="footer__nav-item"><Link to="/articles" className="footer__nav-link">Articles</Link></li>
                <li className="footer__nav-item"><Link to="/#contact" className="footer__nav-link">Contact</Link></li>
              </ul>
            </nav>
          </div>
          
          {/* Social Media */}
          <div className="footer__social-section">
            <h3 className="footer__title">Follow</h3>
            <div className="footer__social">
              <a href="https://www.facebook.com/profile.php?id=61576776489299" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                <i className="fa-brands fa-facebook" aria-hidden="true"></i>
              </a>
              <a href="https://www.linkedin.com/in/deanforantdesigns/" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
              </a>
              <a href="https://www.behance.net/deanforant" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Behance">
                <i className="fa-brands fa-behance" aria-hidden="true"></i>
              </a>
              <a href="https://www.youtube.com/@DeanForantDesigns" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube">
                <i className="fa-brands fa-youtube" aria-hidden="true"></i>
              </a>
              <a href="https://github.com/DForant" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
                <i className="fa-brands fa-github" aria-hidden="true"></i>
              </a>
              <a href="https://www.instagram.com/forantdean/" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <i className="fa-brands fa-instagram" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="footer__bottom">
          <small className="footer__copyright">&copy; <span id="year">{year}</span> Dean Forant. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
