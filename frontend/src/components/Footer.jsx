import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  useEffect(() => {
    const yearElement = document.getElementById('year')
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear()
    }
  }, [])

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo and Tagline */}
          <div className="footer__brand">
            <img src="/images/Logo Light BG.png" alt="Dean Forant logo" className="footer__logo" />
            <p className="footer__tagline">Brand & web design rooted in strategy.</p>
          </div>
          
          {/* Quick Links */}
          <div className="footer__links">
            <h3 className="footer__title">Quick Links</h3>
            <nav className="footer__nav">
              <ul className="footer__nav-list">
                <li className="footer__nav-item"><a href="/#home" className="footer__nav-link">Home</a></li>
                <li className="footer__nav-item"><a href="/#about" className="footer__nav-link">About</a></li>
                <li className="footer__nav-item"><a href="/#services" className="footer__nav-link">Services</a></li>
                <li className="footer__nav-item"><a href="/#portfolio-section" className="footer__nav-link">Portfolio</a></li>
                <li className="footer__nav-item"><Link to="/articles" className="footer__nav-link">Articles</Link></li>
                <li className="footer__nav-item"><a href="/#contact" className="footer__nav-link">Contact</a></li>
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
          <small className="footer__copyright">&copy; <span id="year"></span> Dean Forant. All rights reserved.</small>
        </div>
      </div>
    </footer>
  )
}

export default Footer
