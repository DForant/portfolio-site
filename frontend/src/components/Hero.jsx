/**
 * Hero component - Main hero section
 * @param {Object} props
 * @param {string} props.title - Hero headline
 * @param {string} props.subtitle - Hero subtitle text
 * @param {string} props.imageSrc - Portrait image source
 * @param {string} props.imageAlt - Portrait image alt text
 * @param {Object} props.primaryCta - Primary CTA {text, href}
 * @param {Object} props.secondaryCta - Secondary CTA {text, href}
 */
function Hero({
  title = 'Crafting Your Vision Into A Brand And Web Design That Wins',
  subtitle = "Your Vision, My Expertise. Let's Build a Brand That Stands Out.",
  imageSrc = '/assets/images/dean-portrait-80.jpg',
  imageAlt = 'Dean Forant',
  primaryCta = { text: 'View My Work', href: '#portfolio-section' },
  secondaryCta = { text: 'Get In Touch', href: '#contact' },
}) {
  // Handle smooth scrolling for anchor links
  const handleClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="hero" aria-label="Hero">
      <div className="section__container">
        <div className="hero__image">
          <img id="dean-portrait" src={imageSrc} alt={imageAlt} />
        </div>
        <div className="hero__content">
          <h1 className="hero__title">{title}</h1>
          <p className="hero__subtitle">{subtitle}</p>
          <div className="hero__actions">
            <a
              className="btn btn--primary"
              href={primaryCta.href}
              onClick={(e) => handleClick(e, primaryCta.href)}
            >
              {primaryCta.text}
            </a>
            <a
              className="btn btn--secondary"
              href={secondaryCta.href}
              onClick={(e) => handleClick(e, secondaryCta.href)}
            >
              {secondaryCta.text}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
