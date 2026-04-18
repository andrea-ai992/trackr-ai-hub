import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ModuleCard = ({
  id,
  title,
  description,
  icon: Icon,
  path,
  status = 'default',
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    } else if (path) {
      navigate(path);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'new':
        return <span className="status-badge new">NEW</span>;
      case 'live':
        return <span className="status-badge live">LIVE</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`module-card ${className}`} onClick={handleClick}>
      <div className="module-card-header">
        {Icon && <Icon size={24} className="module-icon" />}
        {getStatusBadge()}
      </div>
      <h3 className="module-title">{title}</h3>
      <p className="module-description">{description}</p>
      <div className="module-footer">
        <ArrowRight size={16} className="arrow-icon" />
      </div>
    </div>
  );
};

export default ModuleCard;
```

```css
.module-card {
  --card-bg: var(--bg2);
  --card-border: var(--border);

  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.module-card:hover {
  background: color-mix(in srgb, var(--card-bg) 90%, white 10%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
}

.module-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.module-icon {
  color: var(--green);
  stroke-width: 2;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
  margin: 0 0 8px 0;
}

.module-description {
  font-size: 14px;
  color: var(--t2);
  margin: 0 0 12px 0;
  flex-grow: 1;
}

.module-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.arrow-icon {
  color: var(--green);
  stroke-width: 2;
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.new {
  background: rgba(0, 255, 136, 0.2);
  color: var(--green);
  border: 1px solid var(--green);
}

.status-badge.live {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  border: 1px solid #ff0000;
}