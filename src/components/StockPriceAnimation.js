Création du fichier `src/components/StockPriceAnimation.js` :

```jsx
import React from 'react';
import { useMediaQuery } from 'react-router-dom';
import { styled } from 'styled-components';
import { interpolateNumber } from 'lucide-react';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  font-family: 'Inter', sans-serif;
`;

const Gradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom, var(--green), var(--bg2));
  z-index: -1;
`;

const PriceContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Price = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
`;

const Change = styled.span`
  font-size: 18px;
  color: var(--t2);
`;

const Animation = styled.span`
  font-size: 18px;
  color: var(--t3);
  animation: animate 5s infinite;
  @keyframes animate {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const StockPriceAnimation = ({ price, change }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const interpolate = interpolateNumber(price, 0, 1000);

  return (
    <Container>
      <Gradient />
      <PriceContainer>
        <Price>{price}</Price>
        <Change>{change}%</Change>
        <Animation>{interpolate}%</Animation>
      </PriceContainer>
    </Container>
  );
};

export default StockPriceAnimation;
```

Intégration du composant `StockPriceAnimation` dans la page `Markets Stocks` :

```jsx
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import StockPriceAnimation from '../components/StockPriceAnimation';

const MarketsStocks = () => {
  const match = useRouteMatch();
  const stocks = [
    { name: 'AAPL', price: 150.23, change: 2.5 },
    { name: 'GOOG', price: 2500.12, change: 3.2 },
    { name: 'AMZN', price: 2000.56, change: 4.5 },
  ];

  return (
    <div>
      <h1>Markets Stocks</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.name}>
            <StockPriceAnimation price={stock.price} change={stock.change} />
            <p>{stock.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketsStocks;
```

Assurez-vous d'installer les dépendances nécessaires dans votre fichier `package.json` :

```json
"dependencies": {
  "react": "^18.2.0",
  "react-router-dom": "^6.4.2",
  "lucide-react": "^1.0.0"
},
```

N'oubliez pas de mettre à jour votre fichier `styles.css` pour inclure les variables CSS :

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