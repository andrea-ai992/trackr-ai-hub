**src/pages/Performance/index.js**
```jsx
import React from 'react';
import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container, Box, Typography, LinearProgress } from '@supabase/ui';
import { styled } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const StyledContainer = styled(Container)`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  font-family: var(--font-inter);
`;

const PerformancePage = lazy(() => import('./PerformancePage'));

const Loader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      backgroundColor="#080808"
    >
      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <Typography variant="h4" color="primary">
          Chargement...
        </Typography>
      )}
    </Box>
  );
};

const Performance = () => {
  return (
    <StyledContainer maxWidth="lg">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loader />}>
                <PerformancePage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </StyledContainer>
  );
};

export default Performance;
```

**src/pages/Performance/PerformancePage.js**
```jsx
import React from 'react';
import { Container, Box, Typography } from '@supabase/ui';
import { styled } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const StyledContainer = styled(Container)`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  font-family: var(--font-inter);
`;

const PerformancePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <StyledContainer maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        backgroundColor="#080808"
      >
        <Typography variant="h2" color="primary">
          Performance
        </Typography>
        <Typography variant="body1" color="secondary">
          Cette page est en cours de développement...
        </Typography>
      </Box>
    </StyledContainer>
  );
};

export default PerformancePage;
```

**src/pages/Performance/index.css**
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
  font-family: var(--font-inter);
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--bg);
}

.loader linear-progress {
  margin: 0 auto;
}
```

**package.json**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.4.2",
    "lucide-react": "^0.1.0",
    "@supabase/ui": "^0.1.0",
    "styled-components": "^5.3.5",
    "react-responsive": "^9.0.0",
    "@next/font": "^3.0.0"
  }
}