Création du fichier Pricing.js dans src/pages/Sports

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/supabase-js';
import { Inter } from '@fontsource/inter';
import { styled } from 'styled-components';
import { fadeUp, ping, shimmer } from '../index.css';

const Container = styled.div`
  background-color: var(--bg);
  padding: 20px;
  color: var(--t1);
  font-family: Inter;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: var(--green);
  font-size: 24px;
  margin: 0;
`;

const Subtitle = styled.p`
  color: var(--t2);
  font-size: 18px;
  margin: 0;
`;

const PriceContainer = styled.div`
  background-color: var(--bg2);
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 20px;
  animation: ${fadeUp} 1s;
`;

const Price = styled.p`
  color: var(--t1);
  font-size: 24px;
  margin: 0;
`;

const Change = styled.p`
  color: var(--t3);
  font-size: 18px;
  margin: 0;
`;

const Button = styled.button`
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  animation: ${ping} 1s;
`;

const Data = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const Icon = styled.i`
  color: var(--green);
  font-size: 24px;
  margin-right: 10px;
`;

const Label = styled.p`
  color: var(--t2);
  font-size: 18px;
  margin: 0;
`;

const Value = styled.p`
  color: var(--t1);
  font-size: 24px;
  margin: 0;
`;

const Shimmer = styled.div`
  background-color: var(--bg);
  height: 20px;
  width: 100%;
  animation: ${shimmer} 2s;
`;

function Pricing() {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data, error } = await supabase
          .from('prices')
          .select('id, value, change');
        if (error) {
          console.error(error);
        } else {
          setPrices(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrices();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Prix en temps réel</Title>
        <Subtitle>Obtenez les dernières informations sur les prix</Subtitle>
      </Header>
      <Data>
        {prices.map((price) => (
          <DataItem key={price.id}>
            <Icon className="fas fa-arrow-up" />
            <Label>Dernier prix</Label>
            <Value>{price.value}</Value>
          </DataItem>
        ))}
      </Data>
      {loading ? (
        <Shimmer />
      ) : (
        prices.map((price) => (
          <PriceContainer key={price.id}>
            <Price>{price.value}</Price>
            <Change>{price.change}</Change>
          </PriceContainer>
        ))
      )}
      <Button onClick={() => navigate('/crypto-trader')}>Voir les données</Button>
    </Container>
  );
}

export default Pricing;
```

Création du fichier index.css dans src

```css
/* Animations */
@keyframes fadeUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes ping {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 0;
  }
}

/* Variables CSS */
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

Création du fichier package.json dans le répertoire racine

```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.4.2",
    "lucide-react": "^1.0.0",
    "@supabase/supabase-js": "^1.4.0",
    "@fontsource/inter": "^4.8.0",
    "styled-components": "^5.3.5"
  },
  "devDependencies": {
    "vite": "^4.3.0"
  }
}
```

Création du fichier Supabase.js dans src

```jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trackr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;