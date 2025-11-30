/**
 * Hero component - Main hero section with title, subtitle, and CTAs
 * @returns {JSX.Element}
 */
function Hero() {
  return (
    <section className="hero" aria-label="Hero">
      <div className="section__container">
        <div className="hero__image">
          <img 
            id="dean-portrait" 
            src="/assets/images/dean-portrait-80.jpg" 
            alt="Dean Forant" 
          />
        </div>
        <div className="hero__content">
          <h1 className="hero__title">
            Crafting Your Vision Into A Brand And Web Design That Wins
          </h1>
          <p className="hero__subtitle">
            Your Vision, My Expertise. Let's Build a Brand That Stands Out.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#portfolio-section">
              View My Work
            </a>
            <a className="btn btn--secondary" href="#contact">
              Get In Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
