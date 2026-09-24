import React, { useState, useEffect } from 'react';
import CatalogPage from './pages/CatalogPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Support both / and /products routing
  if (currentPath === '/' || currentPath === '/products' || currentPath === '') {
    return <CatalogPage />;
  }

  return <CatalogPage />;
}
