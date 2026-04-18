**src/pages/Signals.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Inter } from '@fontsource/inter';
import { Badge, Button, Card, Col, Container, Grid, Row, Typography } from 'lucide-react';
import { supabase } from '../api/supabase';
import { getSignals } from '../api/signals';

const Signals = () => {
  const location = useLocation();
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchSignals = async () => {
      const signalsData = await getSignals();
      setSignals(signalsData);
      setLastUpdated(new Date(signalsData[0].timestamp).toLocaleString());
    };
    fetchSignals();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredSignals = signals.filter((signal) => {
    if (filter === 'Tous') return true;
    if (filter === 'BUY' && signal.signal === 'BUY') return true;
    if (filter === 'SELL' && signal.signal === 'SELL') return true;
    if (filter === 'HOLD' && signal.signal === 'HOLD') return true;
    return false;
  });

  return (
    <Container className="signals-page">
      <Grid className="signals-header">
        <Row>
          <Col>
            <Typography variant="h1" className="title">
              Signaux IA Trading
            </Typography>
          </Col>
          <Col>
            <Button variant="primary" className="refresh-button">
              Dernière mise à jour : {lastUpdated}
            </Button>
          </Col>
          <Col>
            <select value={filter} onChange={handleFilterChange}>
              <option value="Tous">Tous</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="HOLD">HOLD</option>
            </select>
          </Col>
        </Row>
      </Grid>
      <Grid className="signals-grid">
        {filteredSignals.map((signal, index) => (
          <Card key={index} className="signal-card">
            <Grid>
              <Row>
                <Col>
                  <Typography variant="h2" className="ticker">
                    {signal.ticker}
                  </Typography>
                </Col>
                <Col>
                  <Typography variant="h3" className="name">
                    {signal.name}
                  </Typography>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Typography variant="h4" className="price">
                    Prix simulé : {signal.price}€
                  </Typography>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Badge className="score-badge" color={signal.score < 50 ? 'red' : 'green'}>
                    <Typography variant="h5" className="score">
                      {signal.score}%
                    </Typography>
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Badge className="rsi-badge" color={signal.rsi < 30 ? 'green' : signal.rsi > 70 ? 'red' : 'yellow'}>
                    <Typography variant="h5" className="rsi">
                      RSI : {signal.rsi}%
                    </Typography>
                  </Badge>
                </Col>
                <Col>
                  <Badge className="macd-badge" color={signal.macd === 'bullish' ? 'green' : signal.macd === 'bearish' ? 'red' : 'yellow'}>
                    <Typography variant="h5" className="macd">
                      MACD : {signal.macd}
                    </Typography>
                  </Badge>
                </Col>
                <Col>
                  <Badge className="volume-badge" color={signal.volume === 'high' ? 'green' : signal.volume === 'low' ? 'red' : 'yellow'}>
                    <Typography variant="h5" className="volume">
                      Volume : {signal.volume}
                    </Typography>
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Badge className="signal-badge" color={signal.signal === 'BUY' ? 'green' : signal.signal === 'SELL' ? 'red' : 'yellow'}>
                    <Typography variant="h5" className="signal">
                      Signal : {signal.signal}
                    </Typography>
                  </Badge>
                </Col>
              </Row>
            </Grid>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default Signals;
```

**src/api/signals.js**
```javascript
import supabase from '../api/supabase';

const getSignals = async () => {
  const { data, error } = await supabase
    .from('signals')
    .select('ticker, name, price, score, rsi, macd, volume, signal, timestamp')
    .order('timestamp', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export { getSignals };
```

**src/pages/Signals.css**
```css
.signals-page {
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.signals-header {
  background-color: var(--bg2);
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 24px;
  font-weight: bold;
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
}

.signals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.signal-card {
  background-color: var(--bg3);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.ticker {
  font-size: 18px;
  font-weight: bold;
}

.name {
  font-size: 16px;
  color: var(--t2);
}

.price {
  font-size: 14px;
  color: var(--t3);
}

.score-badge {
  background-color: var(--green);
  color: var(--t1);
  padding: 5px 10px;
  border-radius: 5px;
}

.score {
  font-size: 14px;
  color: var(--t1);
}

.rsi-badge {
  background-color: var(--green);
  color: var(--t1);
  padding: 5px 10px;
  border-radius: 5px;
}

.rsi {
  font-size: 14px;
  color: var(--t1);
}

.macd-badge {
  background-color: var(--green);
  color: var(--t1);
  padding: 5px 10px;
  border-radius: 5px;
}

.macd {
  font-size: 14px;
  color: var(--t1);
}

.volume-badge {
  background-color: var(--green);
  color: var(--t1);
  padding: 5px 10px;
  border-radius: 5px;
}

.volume {
  font-size: 14px;
  color: var(--t1);
}

.signal-badge {
  background-color: var(--green);
  color: var(--t1);
  padding: 5px 10px;
  border-radius: 5px;
}

.signal {
  font-size: 14px;
  color: var(--t1);
}