import React from 'react'

function Portfolio() {
  const projects = [
    {
      title: 'Cedarhurst Brewing Company',
      description: 'Complete brand identity and web design for a craft brewery',
      image: '/images/cedarhurst-brewing-thumbnail.jpg',
      link: 'https://www.behance.net/gallery/227216357/Cedarhurst-Brewing-Co-Brand-Design-Project'
    },
    {
      title: 'The Coffee Guild',
      description: 'Concept Logo designs for a coffee shop',
      image: '/images/coffeeguild-thumbnail.png',
      link: 'https://www.behance.net/gallery/231368347/Coffee-Guild-Logo-Design-Concept-Case-Study'
    },
    {
      title: 'The Chuckle Canvas',
      description: 'Creative direction and brand identity for an online T-Shirt and merchandise store',
      image: '/images/the-chuckle-canvas-thumb.jpg',
      link: 'https://www.behance.net/gallery/230920995/The-Chuckle-Canvas-Logo-Refinement-Mascot-Creation'
    }
  ]

  return (
    <section id="portfolio-section" className="portfolio" aria-labelledby="portfolio-title">
      <div className="section__container">
        <h2 id="portfolio-title" className="section__title">Selected Works</h2>
        
        {/* Note about external links */}
        <p className="portfolio__note" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
          <small>Note: Clicking on project links will open the projects in a new browser tab.</small>
        </p>
        
        <div className="portfolio__grid">
          {projects.map((project, index) => (
            <article key={index} className="card card--project">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="card__link" 
                aria-label={`View ${project.title} project`}
              >
                <div className="card__image">
                  <img src={project.image} alt={`${project.title} project preview`} />
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
  )
}

export default Portfolio
