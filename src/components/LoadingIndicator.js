Créer un composant de chargement pour les pages lourdes de Trackr/Performance

**src/components/LoadingIndicator.js**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Ring = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--green);
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Text = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  color: var(--t1);
`;

const LoadingIndicator = () => {
  return (
    <Container>
      <Ring />
      <Text>Loading...</Text>
    </Container>
  );
};

export default LoadingIndicator;
```

**src/pages/Performance/index.js**
```jsx
import React from 'react';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';

const PerformancePage = lazy(() => import('../pages/PerformancePage'));

const Performance = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/performance"
          element={
            <Suspense fallback={<LoadingIndicator />}>
              <PerformancePage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Performance;
```

**src/pages/PerformancePage.js**
```jsx
import React from 'react';

const PerformancePage = () => {
  // Code de la page de performance
  return (
    <div>
      <h1>Performance</h1>
      <p>Ceci est la page de performance</p>
    </div>
  );
};

export default PerformancePage;
```

**src/styles/global.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

h1 {
  color: var(--t2);
}

p {
  color: var(--t3);
}
```

**src/components/LoadingIndicator.js** utilise les CSS vars pour définir les couleurs et les styles du composant de chargement. Le composant est mobile-first et utilise l'animation pour créer un effet de rotation.

**src/pages/Performance/index.js** utilise React Suspense pour gérer les données asynchrones et afficher le composant de chargement pendant la charge de la page de performance. Le composant de chargement est importé depuis src/components/LoadingIndicator.js.

**src/pages/PerformancePage.js** est la page de performance qui sera chargée lorsque l'utilisateur accède à la route /performance.