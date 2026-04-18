src/components/Card/Card.jsx
```jsx
import { useEffect, useRef } from 'react';
import './Card.css';

export const Card = ({
  title,
  subtitle,
  children,
  className = '',
  delay = 0,
  stagger = 340,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 340ms ease-out, transform 340ms ease-out`;
            card.style.transitionDelay = `${delay}ms`;

            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(card);

    return () => {
      if (card) observer.unobserve(card);
    };
  }, [delay, stagger]);

  return (
    <div
      ref={cardRef}
      className={`card ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {title && (
        <h3 className="card-title">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="card-subtitle">
          {subtitle}
        </p>
      )}
      {children && (
        <div className="card-content">
          {children}
        </div>
      )}
    </div>
  );
};
```

src/components/Card/Card.css
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  src: local('Inter var'), url('/fonts/Inter.var.woff2') format('woff2-variations');
  font-display: swap;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  opacity: 1;
  transform: translateY(0);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--t1);
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--t2);
  margin-bottom: 12px;
}

.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}