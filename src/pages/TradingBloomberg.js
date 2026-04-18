// src/pages/TradingBloomberg.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container, Header, Title, Subtitle, Text, Button, Grid, Card } from 'lucide-react';
import { styled } from 'styled-components';
import { useMediaQuery } from 'react-responsive';

const StyledContainer = styled(Container)`
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const StyledHeader = styled(Header)`
  background-color: var(--bg2);
  color: var(--t1);
  padding: 10px;
  border-bottom: 1px solid var(--border);
`;

const StyledTitle = styled(Title)`
  font-size: 24px;
  color: var(--green);
`;

const StyledSubtitle = styled(Subtitle)`
  font-size: 18px;
  color: var(--t2);
`;

const StyledText = styled(Text)`
  font-size: 14px;
  color: var(--t3);
`;

const StyledButton = styled(Button)`
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
`;

const StyledGrid = styled(Grid)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
`;

const StyledCard = styled(Card)`
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

function TradingBloomberg() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <BrowserRouter>
      <StyledContainer>
        <StyledHeader>
          <StyledTitle>Bloomberg Trading</StyledTitle>
          <StyledSubtitle>Stay up-to-date with the latest market news and trends</StyledSubtitle>
        </StyledHeader>
        <StyledGrid>
          <StyledCard>
            <StyledText>Card 1</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
          <StyledCard>
            <StyledText>Card 2</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
          <StyledCard>
            <StyledText>Card 3</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
        </StyledGrid>
      </StyledContainer>
    </BrowserRouter>
  );
}

export default TradingBloomberg;
```

```javascript
// src/pages/TradingBloomberg.css
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
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: var(--bg2);
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 24px;
  color: var(--green);
}

.subtitle {
  font-size: 18px;
  color: var(--t2);
}

.text {
  font-size: 14px;
  color: var(--t3);
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.card {
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
```

```javascript
// src/pages/TradingBloomberg.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container, Header, Title, Subtitle, Text, Button, Grid, Card } from 'lucide-react';
import { styled } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import './TradingBloomberg.css';

function TradingBloomberg() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <BrowserRouter>
      <StyledContainer>
        <StyledHeader>
          <StyledTitle>Bloomberg Trading</StyledTitle>
          <StyledSubtitle>Stay up-to-date with the latest market news and trends</StyledSubtitle>
        </StyledHeader>
        <StyledGrid>
          <StyledCard>
            <StyledText>Card 1</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
          <StyledCard>
            <StyledText>Card 2</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
          <StyledCard>
            <StyledText>Card 3</StyledText>
            <StyledButton>Learn More</StyledButton>
          </StyledCard>
        </StyledGrid>
      </StyledContainer>
    </BrowserRouter>
  );
}

export default TradingBloomberg;
```

```javascript
// package.json
"dependencies": {
  "react": "^18.2.0",
  "react-router-dom": "^6.4.2",
  "lucide-react": "^2.0.0",
  "styled-components": "^5.3.5",
  "react-responsive": "^9.0.0",
  "inter-ui": "^1.0.0"
}