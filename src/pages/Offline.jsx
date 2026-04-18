src/pages/Offline.jsx
```jsx
import { useEffect } from 'react';

export default function Offline() {
  useEffect(() => {
    document.title = 'Offline Mode | Trackr';
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="offline-page">
      <div className="offline-content">
        <h1 className="offline-title">Offline Mode</h1>
        <p className="offline-message">
          It looks like you're currently offline. Please check your connection and try again.
        </p>
        <button className="retry-button" onClick={handleRetry}>
          Retry Connection
        </button>
      </div>
    </div>
  );
}
```

src/pages/Offline.css
```css
.offline-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.offline-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.offline-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--green);
}

.offline-message {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: var(--t2);
  line-height: 1.5;
}

.retry-button {
  background-color: var(--green);
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.retry-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.retry-button:active {
  transform: translateY(0);
}