src/components/PageTransition.jsx

import { useEffect, useRef, useState } from 'react';

const PageTransition = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, []);

  const transitionStyles = {
    opacity: isVisible && !isLeaving ? 1 : 0,
    transform: isVisible && !isLeaving ? 'translateY(0px)' : 'translateY(8px)',
    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
    willChange: 'opacity, transform',
  };

  return (
    <div
      ref={containerRef}
      className={`page-transition-wrapper ${className}`}
      style={transitionStyles}
    >
      {children}
    </div>
  );
};

export default PageTransition;