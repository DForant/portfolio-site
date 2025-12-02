import { useState, useEffect, useRef } from 'react';

/**
 * Header component - Reusable navigation header
 * @param {Object} props
 * @param {Array} props.navLinks - Array of navigation links [{href, label}]
 * @param {string} props.logoSrc - Logo image source
 * @param {string} props.logoAlt - Logo alt text
 * @param {string} props.ctaText - CTA button text
 * @param {string} props.ctaHref - CTA button href
 */
function Header({
  navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#clients', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio-section', label: 'Portfolio' },
    { href: '#contact', label: 'Contact' },
  ],
  logoSrc = '/assets/images/banner-logo.png',
  logoAlt = 'Dean Forant Brand & Web Design',
  ctaText = '(904) 323-1404',
  ctaHref = 'tel:+1-904-323-1404',
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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

  // Handle smooth scrolling for anchor links
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeMenu();
    }
  };

  return (
    <header
      ref={headerRef}
      className={`header${isMenuOpen ? ' header--menu-open' : ''}`}
    >
      <div className="header__container">
        <a className="header__logo" href="/" aria-label="Dean Forant Home">
          <img src={logoSrc} alt={logoAlt} />
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
            {navLinks.map((link) => (
              <li key={link.href} className="header__nav-item">
                <a
                  className="header__nav-link"
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn--primary header__cta" href={ctaHref}>
          {ctaText}
        </a>
      </div>
    </header>
  );
}

export default Header;
