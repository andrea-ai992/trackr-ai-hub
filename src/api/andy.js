Je vais implémenter un système de timeout robuste pour `src/api/andy.js` en utilisant `AbortSignal.timeout()` et améliorer la gestion des erreurs. Voici les modifications :

**src/api/andy.js**
```javascript
import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = new SupabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

const DEFAULT_TIMEOUT = 10000; // 10 secondes par défaut

const andy = {
  async refreshToken(timeout = DEFAULT_TIMEOUT) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data, error } = await supabase.auth.refreshSession(controller.signal);
      clearTimeout(timeoutId);

      if (error) {
        throw new Error(`Failed to refresh token: ${error.message}`);
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Token refresh timed out after ${timeout}ms`);
      }
      throw error;
    }
  },

  async getAccessToken(timeout = DEFAULT_TIMEOUT) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      clearTimeout(timeoutId);

      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`);
      }

      if (!sessionData?.session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.auth.api.getUser(
        sessionData.session.user.id,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (error) {
        throw new Error(`Failed to get access token: ${error.message}`);
      }
      return data.access_token;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Access token retrieval timed out after ${timeout}ms`);
      }
      throw error;
    }
  },

  async fetchWithAuth(url, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

      const response = await axios(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${options.timeout || DEFAULT_TIMEOUT}ms`);
      }
      if (error.response) {
        throw new Error(`Request failed with status ${error.response.status}: ${error.response.statusText}`);
      }
      throw error;
    }
  },
};

export default andy;
```

**src/pages/More/index.js**
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import andy from '../../api/andy';

function More() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await andy.refreshToken();
        setLastRefresh(new Date());
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    }, 60 * 1000); // Refresh token every 1 minute

    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await andy.refreshToken();
      setLastRefresh(new Date());
      navigate(location.pathname, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">More</h1>
      <div className="refresh-info">
        {lastRefresh && (
          <p className="last-refresh">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>
      <button
        className="refresh-button"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing...' : 'Refresh Token'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default More;
```

**src/pages/More/index.css**
```css
.container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.title {
  margin-top: 0;
  color: var(--green);
  font-size: 24px;
  text-align: center;
}

.refresh-info {
  margin-bottom: 20px;
  text-align: center;
}

.last-refresh {
  font-size: 14px;
  color: var(--t3);
  margin: 0;
}

.refresh-button {
  display: block;
  width: 100%;
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--green), black 20%);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #ff4444;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}