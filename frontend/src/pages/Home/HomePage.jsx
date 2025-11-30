import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@components/Hero';
import Clients from '@components/Clients';
import About from '@components/About';
import Services from '@components/Services';
import Portfolio from '@components/Portfolio';
import Contact from '@components/Contact';

/**
 * HomePage component - Main landing page with all sections
 * @returns {JSX.Element}
 */
function HomePage() {
  const location = useLocation();

  // Handle hash navigation on page load and route changes
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      // Scroll to top if no hash
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Handle smooth scrolling for internal anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      const targetId = target.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Add intersection observer for animations
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(
      '.card, .clients__item, .about__media, .about__content'
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
