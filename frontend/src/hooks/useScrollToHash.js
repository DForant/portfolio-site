import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle smooth scrolling for hash navigation
 * Handles both initial page load with hash and hash changes
 */
export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      
      if (element) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else if (location.pathname === '/') {
      // Scroll to top when navigating to home without hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
}
