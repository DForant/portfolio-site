const defaultServices = [
  {
    icon: 'fa-solid fa-pen-ruler',
    title: 'Brand Identity',
    description:
      'Strategy, logos, color systems, and brand guidelines that scale with your business growth.',
  },
  {
    icon: 'fa-solid fa-object-group',
    title: 'UI/UX & Web Design',
    description:
      'Site architecture, responsive UI, and production-ready design systems that convert visitors into customers.',
  },
  {
    icon: 'fa-solid fa-list-check',
    title: 'Creative Direction',
    description:
      'Creative leadership across campaigns, content, and product launches that tell your brand story.',
  },
];

/**
 * ServiceCard component - Individual service card
 * @param {Object} props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.title - Service title
 * @param {string} props.description - Service description
 */
function ServiceCard({ icon, title, description }) {
  return (
    <article className="card card--service">
      <div className="card__icon">
        <i className={icon} aria-hidden="true"></i>
      </div>
      <h3 className="card__title">{title}</h3>
      <p className="card__description">{description}</p>
    </article>
  );
}

/**
 * Services component - Services section with service cards
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.services - Array of services [{icon, title, description}]
 */
function Services({ title = 'Services I Provide', services = defaultServices }) {
  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="section__container">
        <h2 id="services-title" className="section__title">
          {title}
        </h2>
        <div className="services__grid">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
