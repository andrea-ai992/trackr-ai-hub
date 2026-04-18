// src/components/LazyLoader.jsx
import { Suspense } from 'react';
import { Await, defer, useLoaderData } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LazyLoader = ({ children, fallback = <FallbackLoader /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

const FallbackLoader = () => {
  return (
    <div className="lazy-loader-fallback">
      <Loader2 className="lazy-loader-icon" size={24} />
      <span className="lazy-loader-text">Chargement...</span>
    </div>
  );
};

const loader = async (loaderFn) => {
  const promise = loaderFn();
  return defer({ data: promise });
};

export { LazyLoader, loader, FallbackLoader };
```

```css
/* src/components/LazyLoader.css */
.lazy-loader-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  background-color: var(--bg2);
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-direction: column;
  gap: 12px;
}

.lazy-loader-icon {
  color: var(--green);
  animation: spin 1s linear infinite;
}

.lazy-loader-text {
  color: var(--t2);
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}