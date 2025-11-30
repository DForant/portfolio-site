import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import the main SCSS file - Vite will handle the compilation
import '../assets/sass/main.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
