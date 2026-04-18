Voici le composant `ModuleGrid.jsx` complet et fonctionnel :

```jsx
import { Link } from 'react-router-dom';

const ModuleGrid = ({ modules }) => {
  return (
    <div className="module-grid">
      {modules.map((module, index) => (
        <ModuleCard key={index} module={module} />
      ))}
    </div>
  );
};

const ModuleCard = ({ module }) => {
  return (
    <Link to={module.path} className="module-card">
      <div className="module-icon">{module.icon}</div>
      <div className="module-content">
        <h3 className="module-title">{module.title}</h3>
        {module.description && (
          <p className="module-description">{module.description}</p>
        )}
      </div>
      {module.badge && <span className={`badge ${module.badge.type}`}>{module.badge.text}</span>}
    </Link>
  );
};

export default ModuleGrid;
```

Et le fichier CSS correspondant :

```css
.module-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.module-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--t1);
  transition: all 0.2s ease;
  overflow: hidden;
}

.module-card:hover {
  background-color: rgba(0, 255, 136, 0.05);
  border-color: var(--green);
  transform: translateY(-2px);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: rgba(0, 255, 136, 0.1);
  border-radius: 0.5rem;
  color: var(--green);
  font-size: 1.5rem;
}

.module-content {
  flex: 1;
}

.module-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--t1);
}

.module-description {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--t2);
}

.badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.badge.NEW {
  background-color: rgba(0, 255, 136, 0.2);
  color: var(--green);
  border: 1px solid var(--green);
}

.badge.LIVE {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  border: 1px solid #ff0000;
}

/* Responsive */
@media (min-width: 768px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .module-card {
    padding: 1.25rem;
  }
}