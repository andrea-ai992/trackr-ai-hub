Je vais implémenter le skeleton shimmer neon pour les chargements asynchrones en créant un composant réutilisable et en l'intégrant dans le système existant.

```jsx
// src/components/SkeletonLoader.jsx
import { useMemo } from 'react';

export function SkeletonLoader({
  width = '100%',
  height = 'auto',
  borderRadius = '0.25rem',
  count = 1,
  type = 'text',
  className = '',
  style = {}
}) {
  const skeletonItems = useMemo(() => {
    const items = [];
    const baseId = `skeleton-${Math.random().toString(36).substring(2, 9)}`;

    for (let i = 0; i < count; i++) {
      const itemId = `${baseId}-${i}`;

      if (type === 'text') {
        items.push(
          <div
            key={itemId}
            className={`skeleton-text ${className}`}
            style={{
              width,
              height: height,
              borderRadius,
              ...style
            }}
          />
        );
      } else if (type === 'card') {
        items.push(
          <div
            key={itemId}
            className={`skeleton-card ${className}`}
            style={{
              width,
              height: height,
              borderRadius,
              ...style
            }}
          />
        );
      } else if (type === 'avatar') {
        items.push(
          <div
            key={itemId}
            className={`skeleton-avatar ${className}`}
            style={{
              width: width,
              height: width,
              borderRadius: '50%',
              ...style
            }}
          />
        );
      } else if (type === 'circle') {
        items.push(
          <div
            key={itemId}
            className={`skeleton-circle ${className}`}
            style={{
              width,
              height: width,
              borderRadius: '50%',
              ...style
            }}
          />
        );
      }
    }

    return items;
  }, [width, height, borderRadius, count, type, className, style]);

  return <>{skeletonItems}</>;
}

// Ajout des styles dans le fichier global
// src/styles/globals.css
/*
.skeleton-text,
.skeleton-card,
.skeleton-avatar,
.skeleton-circle {
  position: relative;
  overflow: hidden;
  background-color: var(--bg2);
  border: 1px solid var(--border);
}

.skeleton-text,
.skeleton-card {
  display: block;
}

.skeleton-text::after,
.skeleton-card::after,
.skeleton-avatar::after,
.skeleton-circle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--green),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
*/
```

Maintenant, je vais créer un hook personnalisé pour gérer les états de chargement de manière centralisée :

```jsx
// src/hooks/useLoading.js
import { useState } from 'react';

export const useLoading = (initialState = {}) => {
  const [loadingStates, setLoadingStates] = useState(initialState);

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key) => {
    return loadingStates[key] || false;
  };

  return { loadingStates, setLoading, isLoading };
};
```

Je vais aussi mettre à jour le composant Layout pour intégrer le système de skeleton :

```jsx
// src/components/Layout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkSession, setupSessionRefresh, clearSessionRefresh, logout } from '../utils/auth';
import { LogOut } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

export function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await checkSession();
        setIsAuthenticated(!!session);

        if (session) {
          setupSessionRefresh(() => {
            setIsAuthenticated(false);
            navigate('/login', { replace: true });
          });
        }
      } catch (error) {
        console.error('Session verification error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();

    return () => {
      clearSessionRefresh();
    };
  }, [navigate]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setIsAuthenticated(false);
      navigate('/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="layout">
        <header className="layout-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonLoader width="120px" height="32px" type="text" />
            <SkeletonLoader width="100px" height="32px" type="text" />
          </div>
        </header>
        <main className="main-content">
          <SkeletonLoader count={5} height="40px" marginBottom="1rem" type="text" />
          <SkeletonLoader width="80%" height="200px" borderRadius="0.5rem" type="card" />
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Trackr</h1>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn active"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              aria-label="Déconnexion"
            >
              <LogOut size={16} style={{ marginRight: '0.25rem' }} />
              Déconnexion
            </button>
          )}
        </div>
      </header>
      <main className="main-content">
        <Outlet context={{ isAuthenticated, setIsAuthenticated }} />
      </main>
    </div>
  );
}
```

Je vais aussi créer un composant utilitaire pour les chargements de données :

```jsx
// src/components/DataLoader.jsx
import { useEffect, useState } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export function DataLoader({
  fetchFn,
  children,
  loadingComponent,
  errorComponent,
  dependencies = [],
  immediate = true
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);

  useEffect(() => {
    if (!immediate) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  if (isLoading) {
    return loadingComponent || (
      <div style={{ padding: '1rem' }}>
        <SkeletonLoader count={3} height="24px" marginBottom="0.5rem" type="text" />
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div style={{ padding: '1rem', color: 'var(--t2)' }}>
        Erreur de chargement: {error.message}
      </div>
    );
  }

  return children(data);
}
```

Enfin, je vais mettre à jour le hook useAuth pour supporter le chargement :

```jsx
// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { checkSession, getCurrentUser } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const session = await checkSession();
        setIsAuthenticated(!!session);

        if (session) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setUser(null);
        setIsAuthenticated(false);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return { user, isAuthenticated, loading, error };
};