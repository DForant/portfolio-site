import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target) && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleNavClick = (e) => {
    // Only close menu for hash links on home page
    if (location.pathname === '/' && e.target.getAttribute('href')?.startsWith('#')) {
      closeMenu();
    }
  };

  return (
    <header className={`header ${isMenuOpen ? 'header--menu-open' : ''}`} ref={headerRef}>
      <div className="header__container">
        <Link className="header__logo" to="/" aria-label="Dean Forant Home">
          <img src="/assets/images/banner-logo.png" alt="Dean Forant Brand & Web Design" />
        </Link>
        
        <button 
          className="header__toggle" 
          aria-label="Toggle navigation menu" 
          aria-controls="header-nav" 
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="header__toggle-bar"></span>
          <span className="header__toggle-bar"></span>
          <span className="header__toggle-bar"></span>
        </button>
        
        <nav id="header-nav" className="header__nav" aria-label="Primary Navigation">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/#home" onClick={handleNavClick}>Home</Link>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/#clients" onClick={handleNavClick}>About</Link>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/#services" onClick={handleNavClick}>Services</Link>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/#portfolio-section" onClick={handleNavClick}>Portfolio</Link>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/articles" onClick={closeMenu}>Articles</Link>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/#contact" onClick={handleNavClick}>Contact</Link>
            </li>
          </ul>
        </nav>
        
        <a className="btn btn--primary header__cta" href="tel:+1-904-323-1404">(904) 323-1404</a>
      </div>
    </header>
  );
}

export default Header;
