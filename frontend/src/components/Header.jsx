import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const headerRef = useRef(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target) && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <header className={`header ${isMenuOpen ? 'header--menu-open' : ''}`} ref={headerRef}>
      <div className="header__container">
        <Link className="header__logo" to="/" aria-label="Dean Forant Home">
          <img src="/images/banner-logo.png" alt="Dean Forant Brand & Web Design" />
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
              <a className="header__nav-link" href="/#home" onClick={closeMenu}>Home</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="/#clients" onClick={closeMenu}>About</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="/#services" onClick={closeMenu}>Services</a>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="/#portfolio-section" onClick={closeMenu}>Portfolio</a>
            </li>
            <li className="header__nav-item">
              <Link className="header__nav-link" to="/articles" onClick={closeMenu}>Articles</Link>
            </li>
            <li className="header__nav-item">
              <a className="header__nav-link" href="/#contact" onClick={closeMenu}>Contact</a>
            </li>
          </ul>
        </nav>
        
        <a className="btn btn--primary header__cta" href="tel:+1-904-323-1404">(904) 323-1404</a>
      </div>
    </header>
  )
}

export default Header
