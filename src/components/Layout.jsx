Je vais mettre à jour le système d'authentification pour gérer l'expiration des sessions Supabase et implémenter le refresh token automatique. Voici le code pour `src/utils/auth.js` :

```javascript
import { supabase } from '../config/supabaseClient';

let refreshInterval = null;

export const checkSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error checking session:', error);
    return null;
  }
  return session;
};

export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
  return session;
};

export const setupSessionRefresh = (onSessionExpired) => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(async () => {
    const session = await checkSession();
    if (!session) {
      clearInterval(refreshInterval);
      onSessionExpired?.();
      return;
    }

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt - now;

    // Refresh 5 minutes avant l'expiration
    if (timeUntilExpiry <= 5 * 60 * 1000) {
      await refreshSession();
    }
  }, 30 * 1000); // Vérification toutes les 30 secondes
};

export const clearSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export const logout = async () => {
  clearSessionRefresh();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  return true;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};
```

Maintenant, je vais mettre à jour le fichier `src/components/Layout.jsx` pour intégrer le système d'authentification et gérer les sessions :

```jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkSession, setupSessionRefresh, clearSessionRefresh, logout } from '../utils/auth';
import { LogOut } from 'lucide-react';

export function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const session = await checkSession();
      setIsAuthenticated(!!session);

      if (session) {
        setupSessionRefresh(() => {
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        });
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

Enfin, je vais créer un hook personnalisé `src/hooks/useAuth.js` pour simplifier l'utilisation de l'authentification dans les composants :

```javascript
import { useEffect, useState } from 'react';
import { checkSession, getCurrentUser } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return { user, isAuthenticated, loading };
};
```

Ces modifications permettent de :
1. Gérer l'expiration des sessions Supabase (1h par défaut)
2. Rafraîchir automatiquement le token 5 minutes avant l'expiration
3. Déconnecter automatiquement l'utilisateur lorsque la session expire
4. Nettoyer correctement les intervalles lors du logout
5. Fournir un hook personnalisé pour une utilisation simplifiée de l'authentification dans les composants