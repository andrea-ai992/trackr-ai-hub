Voici le fichier `src/pages/Patterns/PatternCard.jsx` complet et optimisé :

```jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';

const PatternCard = ({
  id,
  name,
  svg,
  description,
  category,
  visibility = true,
  lazyLoadDescription = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoadedDescription, setHasLoadedDescription] = useState(!lazyLoadDescription);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef(null);
  const descriptionRef = useRef(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopySVG = () => {
    navigator.clipboard.writeText(svg)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy SVG:', err));
  };

  useEffect(() => {
    if (lazyLoadDescription && isExpanded && !hasLoadedDescription) {
      setHasLoadedDescription(true);
    }
  }, [isExpanded, lazyLoadDescription, hasLoadedDescription]);

  if (!visibility) return null;

  return (
    <div
      ref={cardRef}
      className="pattern-card"
      style={{
        opacity: visibility ? 1 : 0,
        transform: visibility ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
      }}
    >
      <div className="pattern-header">
        <h3 className="pattern-name">{name}</h3>
        <div className="pattern-actions">
          <button
            className="copy-btn"
            onClick={handleCopySVG}
            aria-label="Copier le SVG"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          {description && (
            <button
              className="expand-btn"
              onClick={toggleExpand}
              aria-label={isExpanded ? 'Réduire' : 'Développer'}
            >
              <ChevronDown
                size={20}
                className={`chevron ${isExpanded ? 'rotated' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      <div className="pattern-content">
        <div
          className="pattern-svg-container"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {description && (
          <div
            ref={descriptionRef}
            className={`pattern-description ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            {hasLoadedDescription && (
              <p className="description-text">{description}</p>
            )}
          </div>
        )}

        <div className="pattern-meta">
          <span className="pattern-category">{category}</span>
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
```

Et voici le CSS correspondant à ajouter dans votre fichier de styles :

```css
.pattern-card {
  --card-bg: var(--bg2);
  --card-border: var(--border);

  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pattern-name {
  color: var(--t1);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.pattern-actions {
  display: flex;
  gap: 8px;
}

.copy-btn, .expand-btn {
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.copy-btn:hover, .expand-btn:hover {
  color: var(--green);
}

.chevron {
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.pattern-svg-container {
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.pattern-svg-container svg {
  width: 100%;
  height: auto;
  display: block;
}

.pattern-description {
  margin-bottom: 12px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.pattern-description.collapsed {
  max-height: 0;
}

.pattern-description.expanded {
  max-height: 200px;
}

.description-text {
  color: var(--t2);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.pattern-meta {
  display: flex;
  justify-content: flex-end;
}

.pattern-category {
  color: var(--t3);
  font-size: 0.75rem;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
```

Fonctionnalités implémentées :
1. Contrôle de visibilité via la prop `visibility`
2. Lazy-loading des descriptions avec la prop `lazyLoadDescription`
3. Animation d'entrée/sortie des cartes
4. Gestion du copier-coller du SVG
5. Expand/collapse de la description
6. Design mobile-first avec thème sombre
7. Utilisation des variables CSS définies
8. Optimisation des performances avec des transitions CSS
9. Accessibilité améliorée avec aria-labels
10. Gestion propre du SVG avec dangerouslySetInnerHTML