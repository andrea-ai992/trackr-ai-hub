import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@lucide-react-native';
import { Container, Header, Content, Tab, TabHeading, TabContent, TabPane } from 'src/components';
import { CryptoData, OrderBook, Positions, TabBar } from './components';
import { fetchCryptoData } from './api';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState({
    btc: { price: 0, variation: 0 },
    eth: { price: 0, variation: 0 },
    sol: { price: 0, variation: 0 },
  });
  const [orderBook, setOrderBook] = useState({
    bids: Array(8).fill(0),
    asks: Array(8).fill(0),
  });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', type: 'long', entryPrice: 0, currentPrice: 0, pnl: 0 },
    { symbol: 'ETH', type: 'short', entryPrice: 0, currentPrice: 0, pnl: 0 },
    { symbol: 'SOL', type: 'long', entryPrice: 0, currentPrice: 0, pnl: 0 },
  ]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCryptoData().then((data) => {
        setCryptoData(data);
      });
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newPositions = positions.map((position) => {
        const variation = Math.random() * 10 - 5;
        return {
          ...position,
          currentPrice: position.entryPrice + variation,
          pnl: position.entryPrice + variation - position.entryPrice,
        };
      });
      setPositions(newPositions);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [positions]);

  const handleBuy = (symbol) => {
    const newPositions = positions.map((position) => {
      if (position.symbol === symbol) {
        return { ...position, type: 'long' };
      }
      return position;
    });
    setPositions(newPositions);
  };

  const handleSell = (symbol) => {
    const newPositions = positions.map((position) => {
      if (position.symbol === symbol) {
        return { ...position, type: 'short' };
      }
      return position;
    });
    setPositions(newPositions);
  };

  return (
    <Container>
      <Header>
        <Header.Title>Crypto Trader</Header.Title>
        <Header.Right>
          <Link to="/dashboard">
            <FontAwesomeIcon name="arrow-left" size="lg" color="--text-primary" />
          </Link>
        </Header.Right>
      </Header>
      <Content>
        <Tab>
          <TabHeading>
            <TabBar>
              <TabBarItem active={true}>Marché</TabBarItem>
              <TabBarItem>Positions</TabBarItem>
              <TabBarItem>Historique</TabBarItem>
            </TabBar>
          </TabHeading>
          <TabContent>
            <TabPane>
              <CryptoData cryptoData={cryptoData} />
              <OrderBook orderBook={orderBook} />
            </TabPane>
            <TabPane>
              <Positions positions={positions} onBuy={handleBuy} onSell={handleSell} />
            </TabPane>
            <TabPane>
              {/* Historique */}
            </TabPane>
          </TabContent>
        </Tab>
      </Content>
    </Container>
  );
};

export default CryptoTrader;