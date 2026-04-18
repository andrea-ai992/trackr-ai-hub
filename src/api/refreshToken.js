**src/api/refreshToken.js**
```javascript
import { SupabaseClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = 'https://trackr-app-nu.vercel.app/.supabase';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

export async function refreshToken(req: VercelRequest, res: VercelResponse) {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error('Token absent');
    }

    const { data, error } = await supabase.auth.refreshToken(token);
    if (error) {
      throw error;
    }

    const newToken = data.refreshToken;
    res.cookie('token', newToken, {
      maxAge: 3600000, // 1 heure
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.json({ token: newToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Token expiré ou absent' });
  }
}
```

**src/pages/More/index.js**
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabaseClient } from '../api/andy';
import { refreshToken } from '../api/refreshToken';
import { styled } from 'styled-components';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const Container = styled.div`
  background-color: var(--bg);
  padding: 20px;
  color: var(--t1);
  font-family: var(--font-inter);
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const Button = styled.button`
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: var(--bg2);
  }
`;

const RefreshTokenButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const response = await refreshToken();
      const token = response.token;
      supabaseClient.auth.setAuth(token);
      navigate(location.pathname, { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleRefreshToken} disabled={loading}>
      {loading ? 'Chargement...' : 'Réactualiser token'}
    </Button>
  );
};

const MorePage = () => {
  return (
    <Container>
      <RefreshTokenButton />
      {/* Ajouter d'autres éléments ici */}
    </Container>
  );
};

export default MorePage;
```

**src/api/andy.js**
```javascript
import { SupabaseClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = 'https://trackr-app-nu.vercel.app/.supabase';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

export { supabase, refreshToken };