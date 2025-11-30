/**
 * Service data configuration
 * @type {Array<{icon: string, title: string, description: string}>}
 */
const SERVICES = [
  {
    icon: 'fa-solid fa-pen-ruler',
    title: 'Brand Identity',
    description: 'Strategy, logos, color systems, and brand guidelines that scale with your business growth.',
  },
  {
    icon: 'fa-solid fa-object-group',
    title: 'UI/UX & Web Design',
    description: 'Site architecture, responsive UI, and production-ready design systems that convert visitors into customers.',
  },
  {
    icon: 'fa-solid fa-list-check',
    title: 'Creative Direction',
    description: 'Creative leadership across campaigns, content, and product launches that tell your brand story.',
  },
];

/**
 * Services component - Service cards grid
 * @returns {JSX.Element}
 */
function Services() {
  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="section__container">
        <h2 id="services-title" className="section__title">Services I Provide</h2>
        <div className="services__grid">
          {SERVICES.map((service) => (
            <article key={service.title} className="card card--service">
              <div className="card__icon">
                <i className={service.icon} aria-hidden="true"></i>
              </div>
              <h3 className="card__title">{service.title}</h3>
              <p className="card__description">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
