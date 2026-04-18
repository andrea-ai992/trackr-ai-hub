Création de src/CryptoTrader/CryptoTrader.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container, Header, Content, Button, Text, Icon, Grid, Row, Col } from '@lucide-react/core';
import { SupabaseClient } from '@supabase/supabase-js';

const CryptoTrader = () => {
  const [data, setData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = new SupabaseClient('https://your-supabase-url.supabase.io', 'your-supabase-key');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data: assets, error } = await supabase.from('assets').select('*');
        if (error) {
          setError(error.message);
        } else {
          setData(assets);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleAssetChange = (asset) => {
    setSelectedAsset(asset);
    const fetchChartData = async () => {
      try {
        const { data: chartData, error } = await supabase
          .from('chart_data')
          .select('*')
          .eq('asset_id', asset.id);
        if (error) {
          setError(error.message);
        } else {
          setChartData(chartData);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  };

  const handleBuy = () => {
    // Ajouter la logique de vente ici
  };

  const handleSell = () => {
    // Ajouter la logique de vente ici
  };

  return (
    <Container style={{ backgroundColor: '--bg', color: '--t1' }}>
      <Header>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '--green' }}>CryptoTrader</Text>
      </Header>
      <Content>
        <Grid style={{ padding: '20px' }}>
          <Row>
            <Col span={12}>
              <Text style={{ fontSize: '18px', color: '--t2' }}>Assets</Text>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.map((asset) => (
                  <li key={asset.id} style={{ padding: '10px', borderBottom: '1px solid --border' }}>
                    <Button
                      style={{
                        backgroundColor: '--bg2',
                        color: '--t1',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAssetChange(asset)}
                    >
                      {asset.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={12}>
              <Text style={{ fontSize: '18px', color: '--t2' }}>Chart</Text>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {chartData.map((point, index) => (
                  <li key={index} style={{ padding: '10px', borderBottom: '1px solid --border' }}>
                    <Text style={{ fontSize: '14px', color: '--t3' }}>{point.date}</Text>
                    <Text style={{ fontSize: '14px', color: '--t3' }}>{point.price}</Text>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
          <Row style={{ marginTop: '20px' }}>
            <Col span={12}>
              <Button
                style={{
                  backgroundColor: '--bg2',
                  color: '--t1',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={handleBuy}
              >
                <Icon name="buy" size={24} color="--green" />
                <Text style={{ fontSize: '14px', color: '--t3' }}>Buy</Text>
              </Button>
            </Col>
            <Col span={12}>
              <Button
                style={{
                  backgroundColor: '--bg2',
                  color: '--t1',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={handleSell}
              >
                <Icon name="sell" size={24} color="--green" />
                <Text style={{ fontSize: '14px', color: '--t3' }}>Sell</Text>
              </Button>
            </Col>
          </Row>
        </Grid>
      </Content>
    </Container>
  );
};

export default CryptoTrader;
```

Création de src/CryptoTrader/index.jsx
```jsx
import React from 'react';
import CryptoTrader from './CryptoTrader';

const Index = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CryptoTrader />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Index;
```

Création de src/CryptoTrader/styles.css
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

.Container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.Header {
  background-color: var(--bg2);
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.Content {
  padding: 20px;
}

.Grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.Row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.Col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.Button {
  background-color: var(--bg2);
  color: var(--t1);
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.Button:hover {
  background-color: var(--bg);
}

.Icon {
  margin-right: 10px;
}

.Text {
  font-family: 'Inter', sans-serif;
}
```
Ce code crée une interface utilisateur pour le CryptoTrader avec des boutons, des graphiques et des éléments interactifs. Il utilise les styles CSS pour donner un aspect visuel cohérent à l'application.