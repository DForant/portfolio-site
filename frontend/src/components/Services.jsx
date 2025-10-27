import React from 'react';

function Services() {
  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="section__container">
        <h2 id="services-title" className="section__title">Services I Provide</h2>
        <div className="services__grid">
          <article className="card card--service">
            <div className="card__icon">
              <i className="fa-solid fa-pen-ruler" aria-hidden="true"></i>
            </div>
            <h3 className="card__title">Brand Identity</h3>
            <p className="card__description">Strategy, logos, color systems, and brand guidelines that scale with your business growth.</p>
          </article>
          <article className="card card--service">
            <div className="card__icon">
              <i className="fa-solid fa-object-group" aria-hidden="true"></i>
            </div>
            <h3 className="card__title">UI/UX & Web Design</h3>
            <p className="card__description">Site architecture, responsive UI, and production-ready design systems that convert visitors into customers.</p>
          </article>
          <article className="card card--service">
            <div className="card__icon">
              <i className="fa-solid fa-list-check" aria-hidden="true"></i>
            </div>
            <h3 className="card__title">Creative Direction</h3>
            <p className="card__description">Creative leadership across campaigns, content, and product launches that tell your brand story.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Services;
