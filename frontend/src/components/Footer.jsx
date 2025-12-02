/**
 * Footer component - Reusable site footer
 * @param {Object} props
 * @param {string} props.logoSrc - Logo image source
 * @param {string} props.logoAlt - Logo alt text
 * @param {string} props.tagline - Brand tagline
 * @param {Array} props.quickLinks - Array of quick links [{href, label}]
 * @param {Array} props.socialLinks - Array of social links [{href, label, icon}]
 */
function Footer({
  logoSrc = '/assets/images/Logo Light BG.png',
  logoAlt = 'Dean Forant logo',
  tagline = 'Brand & web design rooted in strategy.',
  quickLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio-section', label: 'Portfolio' },
    { href: '#contact', label: 'Contact' },
  ],
  socialLinks = [
    {
      href: 'https://www.facebook.com/profile.php?id=61576776489299',
      label: 'Facebook',
      iconClass: 'fa-brands fa-facebook',
    },
    {
      href: 'https://www.linkedin.com/in/deanforantdesigns/',
      label: 'LinkedIn',
      iconClass: 'fa-brands fa-linkedin',
    },
    {
      href: 'https://www.behance.net/deanforant',
      label: 'Behance',
      iconClass: 'fa-brands fa-behance',
    },
    {
      href: 'https://www.youtube.com/@DeanForantDesigns',
      label: 'YouTube',
      iconClass: 'fa-brands fa-youtube',
    },
    {
      href: 'https://github.com/DForant',
      label: 'GitHub',
      iconClass: 'fa-brands fa-github',
    },
    {
      href: 'https://www.instagram.com/forantdean/',
      label: 'Instagram',
      iconClass: 'fa-brands fa-instagram',
    },
  ],
}) {
  const currentYear = new Date().getFullYear();

  // Handle smooth scrolling for anchor links
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo and Tagline */}
          <div className="footer__brand">
            <img src={logoSrc} alt={logoAlt} className="footer__logo" />
            <p className="footer__tagline">{tagline}</p>
          </div>

          {/* Quick Links */}
          <div className="footer__links">
            <h3 className="footer__title">Quick Links</h3>
            <nav className="footer__nav">
              <ul className="footer__nav-list">
                {quickLinks.map((link) => (
                  <li key={link.href} className="footer__nav-item">
                    <a
                      href={link.href}
                      className="footer__nav-link"
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Media */}
          <div className="footer__social-section">
            <h3 className="footer__title">Follow</h3>
            <div className="footer__social">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={link.label}
                >
                  <i className={link.iconClass} aria-hidden="true"></i>
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
