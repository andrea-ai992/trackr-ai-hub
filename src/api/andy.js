**src/api/andy.js**
```javascript
import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = new SupabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

const andy = {
  async refreshToken() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAccessToken() {
    try {
      const session = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }
      const { data, error } = await supabase.auth.api.getUser(session.user.id);
      if (error) {
        throw error;
      }
      return data.access_token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async fetchWithAuth(url, options = {}) {
    const accessToken = await this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const response = await axios(url, { ...options, headers });
    return response.data;
  },
};

export default andy;
```

**src/pages/More/index.js**
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import andy from '../api/andy';

function More() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const refreshToken = await andy.refreshToken();
        console.log('Refresh token:', refreshToken);
      } catch (error) {
        setError(error.message);
      }
    }, 60 * 1000); // Refresh token every 1 minute
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshToken = await andy.refreshToken();
      console.log('Refresh token:', refreshToken);
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
      <button className="refresh-button" onClick={handleRefresh}>
        {refreshing ? 'Refreshing...' : 'Refresh'}
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
}

.title {
  margin-top: 0;
}

.refresh-button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: var(--green);
  color: var(--t1);
}

.error {
  color: var(--t2);
  font-size: 14px;
  margin-top: 10px;
}
```

**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import More from './pages/More';
import Dashboard from './pages/Dashboard';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/more" element={<More />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);