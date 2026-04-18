// src/components/FallbackLoader.jsx
import { useEffect } from 'react';

export default function FallbackLoader() {
  useEffect(() => {
    // Animation de chargement simple sans librairies externes
    const loader = document.getElementById('fallback-loader');
    if (loader) {
      let angle = 0;
      const animate = () => {
        angle = (angle + 2) % 360;
        loader.style.transform = `rotate(${angle}deg)`;
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <div className="fallback-loader-container">
      <div className="fallback-loader-spinner" id="fallback-loader"></div>
      <p className="fallback-loader-text">Chargement en cours...</p>
    </div>
  );
}
```

```css
/* src/components/FallbackLoader.css */
.fallback-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.fallback-loader-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  margin-bottom: 1rem;
  transition: transform 0.1s linear;
}

.fallback-loader-text {
  font-size: 1rem;
  color: var(--t2);
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fallback-loader-spinner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .fallback-loader-text {
    font-size: 0.9rem;
  }
}
```

```jsx
// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FallbackLoader from './components/FallbackLoader';

// Lazy load des pages lourdes
const Sports = lazy(() => import('./pages/Sports'));
const Markets = lazy(() => import('./pages/Markets'));
const ChartAnalysis = lazy(() => import('./pages/ChartAnalysis'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes avec lazy loading et fallback dédié */}
        <Route
          path="/sports"
          element={
            <Suspense fallback={<FallbackLoader />}>
              <Sports />
            </Suspense>
          }
        />
        <Route
          path="/markets"
          element={
            <Suspense fallback={<FallbackLoader />}>
              <Markets />
            </Suspense>
          }
        />
        <Route
          path="/chart-analysis"
          element={
            <Suspense fallback={<FallbackLoader />}>
              <ChartAnalysis />
            </Suspense>
          }
        />
        {/* Autres routes sans lazy loading */}
      </Routes>
    </Router>
  );
}

export default App;