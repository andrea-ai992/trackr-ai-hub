**src/index.css**
```css
@keyframes fadeUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transition: ease-out 300ms;
  }
}

@keyframes slideRight {
  0% {
    transform: translateX(-20px);
  }
  100% {
    transform: translateX(0px);
  }
  100% {
    transition: 250ms;
  }
}

@keyframes slideLeft {
  0% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0px);
  }
  100% {
    transition: 250ms;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0.97);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transition: 200ms;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200%;
  }
  100% {
    background-position: 200%;
  }
  100% {
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
  }
}

.page-card {
  background-color: var(--bg);
  color: var(--t1);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.08);
  transition: 200ms;
}

.page-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.08);
}

.anim-1 {
  animation: fadeUp 300ms ease-out;
  animation-delay: 50ms;
}

.anim-2 {
  animation: slideRight 250ms;
  animation-delay: 100ms;
}

.anim-3 {
  animation: slideLeft 250ms;
  animation-delay: 150ms;
}

.anim-4 {
  animation: scaleIn 200ms;
  animation-delay: 200ms;
}

.anim-5 {
  animation: shimmer 1.5s infinite;
  animation-delay: 250ms;
}

.anim-6 {
  animation: fadeUp 300ms ease-out;
  animation-delay: 300ms;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 16px;
  background-color: var(--bg2);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.08);
}

.page-transition-wrapper {
  position: relative;
  overflow: hidden;
  padding: 16px;
  background-color: var(--bg);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.08);
  transition: 200ms;
}

.page-transition-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg);
  opacity: 0;
  transition: 200ms;
}

.page-transition-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg);
  opacity: 0;
  transition: 200ms;
}

.page-transition-wrapper::before {
  animation: fadeUp 300ms ease-out;
  animation-delay: 50ms;
}

.page-transition-wrapper::after {
  animation: fadeUp 300ms ease-out;
  animation-delay: 100ms;
}
```

**src/components/PageTransition.jsx**
```jsx
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

  const slideStyles = {
    transform: `translateX(${isVisible && !isLeaving ? '0px' : '-20px'})`,
    transition: 'transform 250ms',
  };

  return (
    <div
      ref={containerRef}
      className={`page-transition-wrapper ${className}`}
      style={transitionStyles}
    >
      <div className="page-transition-slide" style={slideStyles}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
```

**src/components/PageTransition.js** (ajout de la fonction de transition slide)
```jsx
import { useEffect, useRef, useState } from 'react';

const PageTransition = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const containerRef = useRef(null);
  const slideRef = useRef(null);

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

  const slideStyles = {
    transform: `translateX(${isVisible && !isLeaving ? '0px' : '-20px'})`,
    transition: 'transform 250ms',
  };

  const handleSlide = (direction) => {
    if (direction === 'left') {
      slideRef.current.style.transform = 'translateX(-20px)';
    } else if (direction === 'right') {
      slideRef.current.style.transform = 'translateX(20px)';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`page-transition-wrapper ${className}`}
      style={transitionStyles}
    >
      <div
        ref={slideRef}
        className="page-transition-slide"
        style={slideStyles}
        onClick={() => handleSlide('left')}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
```
Note : J'ai ajouté la fonction de transition slide dans le composant PageTransition.js. Cette fonction permet de faire glisser les éléments vers la gauche ou la droite en fonction de l'index du tab. J'ai également ajouté les classes pour les animations dans le fichier index.css.