const defaultProjects = [
  {
    title: 'Cedarhurst Brewing Company',
    description: 'Complete brand identity and web design for a craft brewery',
    image: '/assets/images/cedarhurst-brewing-thumbnail.jpg',
    href: 'https://www.behance.net/gallery/227216357/Cedarhurst-Brewing-Co-Brand-Design-Project',
  },
  {
    title: 'The Coffee Guild',
    description: 'Concept Logo designs for a coffee shop',
    image: '/assets/images/coffeeguild-thumbnail.png',
    href: 'https://www.behance.net/gallery/231368347/Coffee-Guild-Logo-Design-Concept-Case-Study',
  },
  {
    title: 'The Chuckle Canvas',
    description:
      'Creative direction and brand identity for an online T-Shirt and merchandise store',
    image: '/assets/images/the-chuckle-canvas-thumb.jpg',
    href: 'https://www.behance.net/gallery/230920995/The-Chuckle-Canvas-Logo-Refinement-Mascot-Creation',
  },
];

/**
 * ProjectCard component - Individual project card
 * @param {Object} props
 * @param {string} props.title - Project title
 * @param {string} props.description - Project description
 * @param {string} props.image - Project image source
 * @param {string} props.href - Project link
 */
function ProjectCard({ title, description, image, href }) {
  return (
    <article className="card card--project">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="card__link"
        aria-label={`View ${title} project`}
      >
        <div className="card__image">
          <img src={image} alt={`${title} project preview`} />
          <div className="card__overlay">
            <span className="card__cta">View Project</span>
          </div>
        </div>
        <div className="card__content">
          <h3 className="card__title">{title}</h3>
          <p className="card__description">{description}</p>
        </div>
      </a>
    </article>
  );
}

/**
 * Portfolio component - Portfolio section with project cards
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.note - Note text displayed above grid
 * @param {Array} props.projects - Array of projects [{title, description, image, href}]
 */
function Portfolio({
  title = 'Selected Works',
  note = 'Note: Clicking on project links will open the projects in a new browser tab.',
  projects = defaultProjects,
}) {
  return (
    <section
      id="portfolio-section"
      className="portfolio"
      aria-labelledby="portfolio-title"
    >
      <div className="section__container">
        <h2 id="portfolio-title" className="section__title">
          {title}
        </h2>

        {/* Note about external links */}
        <p
          className="portfolio__note"
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
            fontSize: '0.9em',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          <small>{note}</small>
        </p>

        <div className="portfolio__grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              image={project.image}
              href={project.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
