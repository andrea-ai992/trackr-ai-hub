```javascript
// src/App.jsx
import React, { Suspense, lazy } from 'react';
import RoutesConfig from './routes';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Markets = lazy(() => import('./pages/Markets'));
const Sports = lazy(() => import('./pages/Sports'));
const News = lazy(() => import('./pages/News'));
const More = lazy(() => import('./pages/More'));
const Andy = lazy(() => import('./pages/Andy'));
const Agents = lazy(() => import('./pages/Agents'));
const Portfolio = lazy(() => import('./pages/Portfolio'));

const App = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--t1)',
        fontFamily: 'Inter',
      }}
    >
      <Suspense fallback={<div>Chargement...</div>}>
        <RoutesConfig />
      </Suspense>
    </div>
  );
};

export default App;
```

Et modifier le `src/routes/index.js` pour utiliser les imports lazy :
```javascript
// src/routes/index.js
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Markets = React.lazy(() => import('../pages/Markets'));
const Sports = React.lazy(() => import('../pages/Sports'));
const News = React.lazy(() => import('../pages/News'));
const More = React.lazy(() => import('../pages/More'));
const Andy = React.lazy(() => import('../pages/Andy'));
const Agents = React.lazy(() => import('../pages/Agents'));
const Portfolio = React.lazy(() => import('../pages/Portfolio'));
const FlightTracker = React.lazy(() => import('../pages/FlightTracker'));
const ChartAnalysis = React.lazy(() => import('../pages/ChartAnalysis'));
const Patterns = React.lazy(() => import('../pages/Patterns'));
const CryptoTrader = React.lazy(() => import('../pages/CryptoTrader'));
const Signals = React.lazy(() => import('../pages/Signals'));
const RealEstate = React.lazy(() => import('../pages/RealEstate'));
const BusinessPlan = React.lazy(() => import('../pages/BusinessPlan'));
const Admin = React.lazy(() => import('../pages/Admin'));
const Sneakers = React.lazy(() => import('../pages/Sneakers'));
const Watches = React.lazy(() => import('../pages/Watches'));

const Skeleton = () => (
  <div
    style={{
      height: '200px',
      backgroundColor: 'var(--bg2)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      animation: 'shimmer 2s infinite',
    }}
  />
);

const RoutesConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Skeleton />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/markets"
          element={
            <Suspense fallback={<Skeleton />}>
              <Markets />
            </Suspense>
          }
        />
        <Route
          path="/sports"
          element={
            <Suspense fallback={<Skeleton />}>
              <Sports />
            </Suspense>
          }
        />
        <Route
          path="/news"
          element={
            <Suspense fallback={<Skeleton />}>
              <News />
            </Suspense>
          }
        />
        <Route
          path="/more"
          element={
            <Suspense fallback={<Skeleton />}>
              <More />
            </Suspense>
          }
        />
        <Route
          path="/andy"
          element={
            <Suspense fallback={<Skeleton />}>
              <Andy />
            </Suspense>
          }
        />
        <Route
          path="/agents"
          element={
            <Suspense fallback={<Skeleton />}>
              <Agents />
            </Suspense>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Suspense fallback={<Skeleton />}>
              <Portfolio />
            </Suspense>
          }
        />
        <Route
          path="/flight-tracker"
          element={
            <Suspense fallback={<Skeleton />}>
              <FlightTracker />
            </Suspense>
          }
        />
        <Route
          path="/chart-analysis"
          element={
            <Suspense fallback={<Skeleton />}>
              <ChartAnalysis />
            </Suspense>
          }
        />
        <Route
          path="/patterns"
          element={
            <Suspense fallback={<Skeleton />}>
              <Patterns />
            </Suspense>
          }
        />
        <Route
          path="/crypto-trader"
          element={
            <Suspense fallback={<Skeleton />}>
              <CryptoTrader />
            </Suspense>
          }
        />
        <Route
          path="/signals"
          element={
            <Suspense fallback={<Skeleton />}>
              <Signals />
            </Suspense>
          }
        />
        <Route
          path="/real-estate"
          element={
            <Suspense fallback={<Skeleton />}>
              <RealEstate />
            </Suspense>
          }
        />
        <Route
          path="/business-plan"
          element={
            <Suspense fallback={<Skeleton />}>
              <BusinessPlan />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<Skeleton />}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="/sneakers"
          element={
            <Suspense fallback={<Skeleton />}>
              <Sneakers />
            </Suspense>
          }
        />
        <Route
          path="/watches"
          element={
            <Suspense fallback={<Skeleton />}>
              <Watches />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RoutesConfig;