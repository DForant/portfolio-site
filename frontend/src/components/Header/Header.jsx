import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Navigation link configuration
 * @type {Array<{label: string, href: string, isAnchor?: boolean}>}
 */
const NAV_LINKS = [
  { label: 'Home', href: '/', isAnchor: false },
  { label: 'About', href: '/#clients', isAnchor: true },
  { label: 'Services', href: '/#services', isAnchor: true },
  { label: 'Portfolio', href: '/#portfolio-section', isAnchor: true },
  { label: 'Contact', href: '/#contact', isAnchor: true },
];

/**
 * Header component - Sticky navigation header with responsive mobile menu
 * @param {Object} props - Component props
 * @param {string} [props.currentPage] - Current page identifier for active link styling
 * @returns {JSX.Element}
 */
function Header({ currentPage = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target) && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  // Determine if a link is active
  const isLinkActive = useCallback((link) => {
    // For home page
    if (link.href === '/' && location.pathname === '/' && !currentPage) {
      return true;
    }
    return false;
  }, [currentPage, location.pathname]);

  // Handle anchor link clicks with smooth scrolling
  const handleAnchorClick = useCallback((event, href) => {
    // If we're on the home page and it's an anchor link
    if (location.pathname === '/' && href.startsWith('/#')) {
      event.preventDefault();
      const targetId = href.replace('/#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeMenu();
    }
    // If we're on another page and clicking an anchor, navigation will happen via Link
    closeMenu();
  }, [location.pathname, closeMenu]);

  return (
    <header
      ref={headerRef}
      className={`header${isMenuOpen ? ' header--menu-open' : ''}`}
    >
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
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="header__nav-item">
                <Link
                  className={`header__nav-link${isLinkActive(link) ? ' header__nav-link--active' : ''}`}
                  to={link.href}
                  onClick={(e) => link.isAnchor ? handleAnchorClick(e, link.href) : closeMenu()}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn--primary header__cta" href="tel:+1-904-323-1404">
          (904) 323-1404
        </a>
      </div>
    </header>
  );
}

Header.propTypes = {
  currentPage: PropTypes.string,
};

export default Header;
