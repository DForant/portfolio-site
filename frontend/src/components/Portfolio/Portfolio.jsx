/**
 * Portfolio project data configuration
 * @type {Array<{href: string, image: string, alt: string, title: string, description: string}>}
 */
const PROJECTS = [
  {
    href: 'https://www.behance.net/gallery/227216357/Cedarhurst-Brewing-Co-Brand-Design-Project',
    image: '/assets/images/cedarhurst-brewing-thumbnail.jpg',
    alt: 'Cedarhurst Brewing Company project preview',
    title: 'Cedarhurst Brewing Company',
    description: 'Complete brand identity and web design for a craft brewery',
  },
  {
    href: 'https://www.behance.net/gallery/231368347/Coffee-Guild-Logo-Design-Concept-Case-Study',
    image: '/assets/images/coffeeguild-thumbnail.png',
    alt: 'The Coffee Guild project preview',
    title: 'The Coffee Guild',
    description: 'Concept Logo designs for a coffee shop',
  },
  {
    href: 'https://www.behance.net/gallery/230920995/The-Chuckle-Canvas-Logo-Refinement-Mascot-Creation',
    image: '/assets/images/the-chuckle-canvas-thumb.jpg',
    alt: 'The Chuckle Canvas project preview',
    title: 'The Chuckle Canvas',
    description: 'Creative direction and brand identity for an online T-Shirt and merchandise store',
  },
];

/**
 * Portfolio component - Portfolio projects grid with cards
 * @returns {JSX.Element}
 */
function Portfolio() {
  return (
    <section id="portfolio-section" className="portfolio" aria-labelledby="portfolio-title">
      <div className="section__container">
        <h2 id="portfolio-title" className="section__title">Selected Works</h2>

        {/* Note about external links */}
        <p 
          className="portfolio__note" 
          style={{ 
            textAlign: 'center', 
            marginBottom: '3rem', 
            fontSize: '0.9em', 
            color: '#666', 
            fontStyle: 'italic' 
          }}
        >
          <small>Note: Clicking on project links will open the projects in a new browser tab.</small>
        </p>

        <div className="portfolio__grid">
          {PROJECTS.map((project) => (
            <article key={project.title} className="card card--project">
              <a 
                href={project.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="card__link" 
                aria-label={`View ${project.title} project`}
              >
                <div className="card__image">
                  <img src={project.image} alt={project.alt} />
                  <div className="card__overlay">
                    <span className="card__cta">View Project</span>
                  </div>
                </div>
                <div className="card__content">
                  <h3 className="card__title">{project.title}</h3>
                  <p className="card__description">{project.description}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
