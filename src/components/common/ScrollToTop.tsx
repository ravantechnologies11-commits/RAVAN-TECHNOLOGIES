import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that page transitions reset the scroll position to the top,
 * and handles anchor link navigation (e.g. #tech-park, #solutions) smoothly
 * without layout jumps or frozen viewports.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow slight delay for lazy-loaded components to mount
      const timer = setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return () => clearTimeout(timer);
    } else {
      // Instant reset to top on pure route change
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, hash]);

  return null;
};
