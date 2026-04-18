src/components/Hero/Hero.jsx
```jsx
import React from 'react';
import './Hero.css';

const Hero = ({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  gradient = 'hero-gradient',
  ctaText = 'Get Started',
  ctaAction,
  icon: Icon,
}) => {
  const variants = {
    default: 'hero-default',
    minimal: 'hero-minimal',
    card: 'hero-card',
    gradient: 'hero-gradient',
  };

  return (
    <section className={`hero ${variants[variant]} ${gradient} ${className}`}>
      {Icon && (
        <div className="hero-icon">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      {title && <h1 className="hero-title">{title}</h1>}
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      {children && <div className="hero-content">{children}</div>}
      {ctaText && ctaAction && (
        <button className="hero-cta" onClick={ctaAction}>
          {ctaText}
        </button>
      )}
    </section>
  );
};

export default Hero;
```

src/components/Hero/Hero.css
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.hero {
  position: relative;
  width: 100%;
  padding: clamp(2rem, 8vw, 4rem) 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0.75rem;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.hero-icon {
  margin-bottom: 1rem;
  color: var(--green);
  opacity: 0.8;
}

.hero-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--t1);
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: var(--t2);
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.hero-content {
  margin: 1rem 0;
  width: 100%;
  max-width: 600px;
}

.hero-cta {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--green);
  border: 1px solid var(--green);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.hero-cta:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: var(--green);
  transform: translateY(-2px);
}

.hero-default {
  background: var(--bg2);
  border: 1px solid var(--border);
}

.hero-minimal {
  background: transparent;
  padding: 1rem;
}

.hero-minimal .hero-title {
  font-size: 1.5rem;
}

.hero-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hero-gradient {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0) 50%, var(--bg2) 100%);
}