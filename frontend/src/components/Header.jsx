import { useState, useEffect, useRef } from 'react';

/**
 * Header component for the portfolio site.
 * Includes responsive navigation with mobile hamburger menu.
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`header${isMenuOpen ? ' header--menu-open' : ''}`}
    >
      <div className="header__container">
        <a className="header__logo" href="/" aria-label="Dean Forant Home">
          <img src="assets/images/banner-logo.png" alt="Dean Forant Brand & Web Design" />
        </a>

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
              <a className="header__nav-link" href="#home" onClick={closeMenu}>Home</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="#clients" onClick={closeMenu}>About</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="#services" onClick={closeMenu}>Services</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="#portfolio-section" onClick={closeMenu}>Portfolio</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="#contact" onClick={closeMenu}>Contact</a>
            </li>
          </ul>
        </nav>

        <a className="btn btn--primary header__cta" href="tel:+1-904-323-1404">(904) 323-1404</a>
      </div>
    </header>
  );
}

export default Header;
