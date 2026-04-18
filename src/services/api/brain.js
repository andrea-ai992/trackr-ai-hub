**src/services/api/brain.js**
```javascript
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config';

const api = axios.create({
  baseURL: supabaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': supabaseKey,
  },
});

const brain = {
  async getPatterns() {
    try {
      const response = await api.get('/patterns');
      return response.data;
    } catch (error) {
      console.error('Erreur API BrainExplorer:', error);
      throw error;
    }
  },

  async getChartAnalysis() {
    try {
      const response = await api.get('/chart-analysis');
      return response.data;
    } catch (error) {
      console.error('Erreur API BrainExplorer:', error);
      throw error;
    }
  },
};

export default brain;
```

**src/components/BrainExplorer.js**
```javascript
import React, { useState, useEffect } from 'react';
import brain from '../services/api/brain';
import { Container, Heading, Text, Button, Box } from '@supabase/ui';
import { Inter } from '@fontsource/inter';
import { useTheme } from 'react-jss';

const BrainExplorer = () => {
  const theme = useTheme();
  const [patterns, setPatterns] = useState([]);
  const [chartAnalysis, setChartAnalysis] = useState([]);

  useEffect(() => {
    brain.getPatterns().then((data) => setPatterns(data));
    brain.getChartAnalysis().then((data) => setChartAnalysis(data));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: theme.palette.background.default }}>
      <Heading as="h1" sx={{ color: theme.palette.text.primary, fontSize: 24 }}>
        Brain Explorer
      </Heading>
      <Text sx={{ color: theme.palette.text.secondary, fontSize: 16 }}>
        Découvrez les dernières tendances et analyses de marché
      </Text>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <Button
          variant="primary"
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.border}`,
            padding: 10,
            fontSize: 16,
            '&:hover': {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            },
          }}
        >
          Voir les tendances
        </Button>
        <Button
          variant="primary"
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.border}`,
            padding: 10,
            fontSize: 16,
            '&:hover': {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            },
          }}
        >
          Voir les analyses
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <Heading as="h2" sx={{ color: theme.palette.text.primary, fontSize: 20 }}>
          Tendances
        </Heading>
        <ul>
          {patterns.map((pattern, index) => (
            <li key={index}>
              <Text sx={{ color: theme.palette.text.secondary, fontSize: 16 }}>
                {pattern.title}
              </Text>
            </li>
          ))}
        </ul>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <Heading as="h2" sx={{ color: theme.palette.text.primary, fontSize: 20 }}>
          Analyses
        </Heading>
        <ul>
          {chartAnalysis.map((analysis, index) => (
            <li key={index}>
              <Text sx={{ color: theme.palette.text.secondary, fontSize: 16 }}>
                {analysis.title}
              </Text>
            </li>
          ))}
        </ul>
      </Box>
    </Container>
  );
};

export default BrainExplorer;
```

**src/config.js**
```javascript
export const supabaseUrl = 'https://your-supabase-url.supabase.co';
export const supabaseKey = 'your-supabase-key';
```

**src/styles/variables.css**
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
```

**src/styles/global.css**
```css
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.heading {
  color: var(--t1);
  font-size: 24px;
  margin-bottom: 10px;
}

.text {
  color: var(--t2);
  font-size: 16px;
  margin-bottom: 20px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--green);
  color: var(--t1);
}