**src/App.jsx**
```jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SkeletonPage from './components/SkeletonPage';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Sports from './pages/Sports';
import News from './pages/News';
import More from './pages/More';
import Andy from './pages/Andy';
import Portfolio from './pages/Portfolio';
import BrainStatus from './pages/BrainStatus';

const FlightTracker = lazy(() => import('./pages/FlightTracker'));
const ChartAnalysis = lazy(() => import('./pages/ChartAnalysis'));
const Patterns = lazy(() => import('./pages/Patterns'));
const CryptoTrader = lazy(() => import('./pages/CryptoTrader'));
const Signals = lazy(() => import('./pages/Signals'));
const RealEstate = lazy(() => import('./pages/RealEstate'));
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'));
const Sneakers = lazy(() => import('./pages/Sneakers'));
const Watches = lazy(() => import('./pages/Watches'));
const BrainExplorer = lazy(() => import('./pages/BrainExplorer'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/news" element={<News />} />
        <Route path="/more" element={<More />} />
        <Route path="/andy" element={<Andy />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/brain-status" element={<BrainStatus />} />
        <Route path="/flight-tracker" element={
          <Suspense fallback={<SkeletonPage />}>
            <FlightTracker />
          </Suspense>
        } />
        <Route path="/chart-analysis" element={
          <Suspense fallback={<SkeletonPage />}>
            <ChartAnalysis />
          </Suspense>
        } />
        <Route path="/patterns" element={
          <Suspense fallback={<SkeletonPage />}>
            <Patterns />
          </Suspense>
        } />
        <Route path="/crypto-trader" element={
          <Suspense fallback={<SkeletonPage />}>
            <CryptoTrader />
          </Suspense>
        } />
        <Route path="/signals" element={
          <Suspense fallback={<SkeletonPage />}>
            <Signals />
          </Suspense>
        } />
        <Route path="/real-estate" element={
          <Suspense fallback={<SkeletonPage />}>
            <RealEstate />
          </Suspense>
        } />
        <Route path="/business-plan" element={
          <Suspense fallback={<SkeletonPage />}>
            <BusinessPlan />
          </Suspense>
        } />
        <Route path="/sneakers" element={
          <Suspense fallback={<SkeletonPage />}>
            <Sneakers />
          </Suspense>
        } />
        <Route path="/watches" element={
          <Suspense fallback={<SkeletonPage />}>
            <Watches />
          </Suspense>
        } />
        <Route path="/brain-explorer" element={
          <Suspense fallback={<SkeletonPage />}>
            <BrainExplorer />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
}

export default App;
```

**src/components/SkeletonPage.jsx**
```jsx
import React from 'react';

const SkeletonPage = () => {
  return (
    <div
      style={{
        height: '60vh',
        backgroundColor: '#111',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#00ff88',
          animation: 'shimmer 2s infinite',
          borderRadius: '10px',
        }}
      />
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#00ff88',
          animation: 'shimmer 2s infinite',
          borderRadius: '10px',
          marginTop: '10px',
        }}
      />
    </div>
  );
};

export default SkeletonPage;
```

**vite.config.js**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://trackr-app-nu.vercel.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('react-router-dom')) return 'react-router-dom';
            if (id.includes('lucide-react')) return 'lucide-react';
            return id.split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  css: {
    modules: true,
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/styles/variables.scss";',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-router-dom', 'lucide-react'],
  },
});
```

**src/styles/variables.scss**
```scss
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}
```

**package.json**
```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite serve"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^1.0.0",
    "tailwindcss": "^3.2.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^1.3.0",
    "@tailwindcss/vite": "^1.3.0",
    "vite": "^3.2.3"
  }
}
```

Notez que j'ai ajouté les dépendances nécessaires pour utiliser Tailwind CSS et que j'ai configuré Vite pour utiliser les modules CSS. J'ai également ajouté les styles nécessaires pour le thème sombre.