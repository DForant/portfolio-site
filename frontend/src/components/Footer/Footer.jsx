import { Link } from 'react-router-dom';

/**
 * Quick links configuration
 * @type {Array<{label: string, href: string}>}
 */
const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio-section' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/#contact' },
];

/**
 * Social media links configuration
 * @type {Array<{href: string, label: string, icon: string}>}
 */
const SOCIAL_LINKS = [
  { 
    href: 'https://www.facebook.com/profile.php?id=61576776489299', 
    label: 'Facebook', 
    icon: 'fa-brands fa-facebook' 
  },
  { 
    href: 'https://www.linkedin.com/in/deanforantdesigns/', 
    label: 'LinkedIn', 
    icon: 'fa-brands fa-linkedin' 
  },
  { 
    href: 'https://www.behance.net/deanforant', 
    label: 'Behance', 
    icon: 'fa-brands fa-behance' 
  },
  { 
    href: 'https://www.youtube.com/@DeanForantDesigns', 
    label: 'YouTube', 
    icon: 'fa-brands fa-youtube' 
  },
  { 
    href: 'https://github.com/DForant', 
    label: 'GitHub', 
    icon: 'fa-brands fa-github' 
  },
  { 
    href: 'https://www.instagram.com/forantdean/', 
    label: 'Instagram', 
    icon: 'fa-brands fa-instagram' 
  },
];

/**
 * Footer component - Site-wide footer with navigation, social links, and copyright
 * @returns {JSX.Element}
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo and Tagline */}
          <div className="footer__brand">
            <img 
              src="/assets/images/Logo Light BG.png" 
              alt="Dean Forant logo" 
              className="footer__logo" 
            />
            <p className="footer__tagline">Brand & web design rooted in strategy.</p>
          </div>

          {/* Quick Links */}
          <div className="footer__links">
            <h3 className="footer__title">Quick Links</h3>
            <nav className="footer__nav">
              <ul className="footer__nav-list">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href} className="footer__nav-item">
                    <Link to={link.href} className="footer__nav-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Media */}
          <div className="footer__social-section">
            <h3 className="footer__title">Follow</h3>
            <div className="footer__social">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={social.label}
                >
                  <i className={social.icon} aria-hidden="true"></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer__bottom">
          <small className="footer__copyright">
            &copy; {currentYear} Dean Forant. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
