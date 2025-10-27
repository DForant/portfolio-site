import React from 'react';
import Hero from '../components/Hero';
import Clients from '../components/Clients';
import About from '../components/About';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Contact from '../components/Contact';

function HomePage() {
  return (
    <main id="home">
      <Hero />
      <Clients />
      <About />
      <Services />
      <Portfolio />
      <Contact />
    </main>
  );
}

export default HomePage;
