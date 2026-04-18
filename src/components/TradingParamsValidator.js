Création du composant de validation des paramètres query pour les pages de trading

```javascript
// src/components/TradingParamsValidator.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { styled, css } from 'styled-components';

const TradingParamsValidator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const symbol = queryParams.get('symbol');
  const interval = queryParams.get('interval');
  const timeframe = queryParams.get('timeframe');

  const isValidSymbol = symbol && ['AAPL', 'GOOG', 'MSFT'].includes(symbol);
  const isValidInterval = interval && ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '5d', '1w', '1M'].includes(interval);
  const isValidTimeframe = timeframe && ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '5d', '1w', '1M'].includes(timeframe);

  const handleInvalidParams = () => {
    navigate('/crypto-trader', { replace: true });
  };

  return (
    <Container>
      <Title>Validation des paramètres</Title>
      <List>
        <ListItem>
          <Label>Symbol:</Label>
          <Value>{symbol || '-'}</Value>
          <Validated isValid={isValidSymbol} />
        </ListItem>
        <ListItem>
          <Label>Intervalle:</Label>
          <Value>{interval || '-'}</Value>
          <Validated isValid={isValidInterval} />
        </ListItem>
        <ListItem>
          <Label>Timeframe:</Label>
          <Value>{timeframe || '-'}</Value>
          <Validated isValid={isValidTimeframe} />
        </ListItem>
      </List>
      {(!isValidSymbol || !isValidInterval || !isValidTimeframe) && (
        <Button onClick={handleInvalidParams}>Valider les paramètres</Button>
      )}
    </Container>
  );
};

const Container = styled.div`
  background-color: var(--bg);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: var(--green);
  font-size: 24px;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid var(--border);
`;

const Label = styled.span`
  font-size: 16px;
  color: var(--t2);
`;

const Value = styled.span`
  font-size: 16px;
  color: var(--t1);
`;

const Validated = styled.span`
  color: var(--green);
  font-size: 16px;
  margin-left: 10px;
  ${props => props.isValid && css`
    color: var(--green);
  `}
`;

const Button = styled.button`
  background-color: var(--green);
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

export default TradingParamsValidator;
```

```javascript
// src/components/Trading.js
import React from 'react';
import TradingParamsValidator from './TradingParamsValidator';

const Trading = () => {
  return (
    <div>
      <TradingParamsValidator />
    </div>
  );
};

export default Trading;
```

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

```javascript
// src/utils/supabase.js
import supabase from './supabase';

const isValidSymbol = async (symbol) => {
  const { data, error } = await supabase
    .from('symbols')
    .select('id')
    .eq('symbol', symbol);

  return data.length > 0;
};

const isValidInterval = async (interval) => {
  const { data, error } = await supabase
    .from('intervals')
    .select('id')
    .eq('interval', interval);

  return data.length > 0;
};

const isValidTimeframe = async (timeframe) => {
  const { data, error } = await supabase
    .from('timeframes')
    .select('id')
    .eq('timeframe', timeframe);

  return data.length > 0;
};

export { isValidSymbol, isValidInterval, isValidTimeframe };