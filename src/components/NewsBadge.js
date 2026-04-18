**src/pages/BottomNav.js**
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewsBadge from '../components/NewsBadge';

function BottomNav() {
  const [newsCount, setNewsCount] = useState(0);

  useEffect(() => {
    const fetchNewsCount = async () => {
      const response = await fetch('/api/news/count');
      const count = await response.json();
      setNewsCount(count);
    };
    fetchNewsCount();
  }, []);

  return (
    <nav className="bottom-nav">
      <Link to="/news" className="link">
        <div className="link-content">
          <span className="icon lucide-newspaper" />
          <span className="text">News</span>
          {newsCount > 0 && <NewsBadge count={newsCount} />}
        </div>
      </Link>
    </nav>
  );
}

export default BottomNav;
```

**src/components/NewsBadge.js**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const Badge = styled.div`
  position: relative;
  display: inline-block;
  background-color: var(--bg);
  border-radius: 50%;
  padding: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--t1);
  border: 2px solid var(--border);
  box-shadow: 0 0 0 1px var(--border-hi);

  &::after {
    content: '${props => props.count}';
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background-color: var(--bg2);
    border-radius: 50%;
    padding: 0.25rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--t2);
  }
`;

const NewsBadge = ({ count }) => {
  return <Badge count={count} />;
};

export default NewsBadge;
```

**src/components/NewsBadge.css**
```css
.bottom-nav {
  background-color: var(--bg);
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--bg2);
  color: var(--t1);
  text-decoration: none;
  transition: background-color 0.2s ease-in-out;
}

.link:hover {
  background-color: var(--bg3);
}

.link-content {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 0.5rem;
}

.text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--t2);
}

.news-badge {
  position: relative;
  display: inline-block;
  background-color: var(--bg);
  border-radius: 50%;
  padding: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--t1);
  border: 2px solid var(--border);
  box-shadow: 0 0 0 1px var(--border-hi);
}

.news-badge::after {
  content: '';
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: var(--bg2);
  border-radius: 50%;
  padding: 0.25rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--t2);
}
```

**src/components/index.js**
```jsx
export { default as NewsBadge } from './NewsBadge';
```

**package.json**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "styled-components": "^5.3.5"
  }
}