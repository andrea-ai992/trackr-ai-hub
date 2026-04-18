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
            return id.split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});