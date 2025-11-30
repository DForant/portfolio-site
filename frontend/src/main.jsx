import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header, Footer } from './components';
import './styles.js'; // Import styles

// Initialize Header
const headerRoot = document.getElementById('header-root');
if (headerRoot) {
  createRoot(headerRoot).render(
    <StrictMode>
      <Header />
    </StrictMode>
  );
}

// Initialize Footer
const footerRoot = document.getElementById('footer-root');
if (footerRoot) {
  createRoot(footerRoot).render(
    <StrictMode>
      <Footer />
    </StrictMode>
  );
}

// Initialize year in case Footer hasn't loaded yet
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
