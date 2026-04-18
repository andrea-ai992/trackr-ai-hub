Je vais implémenter les animations et le composant Card selon les spécifications. Voici les fichiers modifiés/ajoutés :

src/styles/animations.css
```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.fadeUp {
  animation: fadeUp 0.3s ease-out forwards;
}

.fadeUp-delay-100 {
  animation: fadeUp 0.3s ease-out 0.1s forwards;
}

.fadeUp-delay-200 {
  animation: fadeUp 0.3s ease-out 0.2s forwards;
}

.ping {
  animation: ping 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.shimmer {
  background: linear-gradient(90deg, var(--border), var(--bg2), var(--border));
  background-size: 2000px 100%;
  animation: shimmer 1.5s infinite;
}
```

src/components/ui/Card.jsx
```jsx
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  fadeUp = false,
  fadeUpDelay = 0,
  ping = false,
  shimmer = false,
  onClick,
  href,
  as: Component = 'div',
  ...props
}) => {
  const baseClasses = 'rounded-xl p-4 border border-[var(--border)] bg-[var(--bg2)] relative overflow-hidden';
  const fadeUpClasses = fadeUp ? `fadeUp${fadeUpDelay ? `-delay-${fadeUpDelay * 100}` : ''}` : '';
  const pingClasses = ping ? 'ping' : '';
  const shimmerClasses = shimmer ? 'shimmer' : '';

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  const cardContent = (
    <Component
      className={`${baseClasses} ${fadeUpClasses} ${pingClasses} ${shimmerClasses} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Component>
  );

  if (href) {
    return (
      <a href={href} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fadeUp: PropTypes.bool,
  fadeUpDelay: PropTypes.number,
  ping: PropTypes.bool,
  shimmer: PropTypes.bool,
  onClick: PropTypes.func,
  href: PropTypes.string,
  as: PropTypes.elementType,
};

export default Card;
```

src/components/ui/SparklineAnimated.jsx
```jsx
import React from 'react';
import PropTypes from 'prop-types';

const SparklineAnimated = ({ data, className = '', color = 'var(--green)' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className={`h-4 w-full ${className}`}>
      <svg viewBox={`0 0 ${data.length} 100`} className="w-full h-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={data
            .map((value, i) => `${i},${100 - ((value - min) / range) * 100}`)
            .join(' ')}
        />
      </svg>
    </div>
  );
};

SparklineAnimated.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
};

export default SparklineAnimated;
```

src/components/ui/Button.jsx
```jsx
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fadeUp = false,
  ping = false,
  shimmer = false,
  ...props
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all active:scale-[0.98] font-inter';

  const variantClasses = {
    primary: 'bg-[var(--green)] text-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--green),black_20%)]',
    secondary: 'bg-[var(--bg2)] text-[var(--t1)] border border-[var(--border)] hover:bg-[var(--bg3)]',
    ghost: 'text-[var(--t1)] hover:bg-[var(--bg2)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const fadeUpClasses = fadeUp ? 'fadeUp' : '';
  const pingClasses = ping ? 'ping' : '';
  const shimmerClasses = shimmer ? 'shimmer' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fadeUpClasses} ${pingClasses} ${shimmerClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fadeUp: PropTypes.bool,
  ping: PropTypes.bool,
  shimmer: PropTypes.bool,
};

export default Button;