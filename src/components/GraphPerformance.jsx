import React from 'react';
import { Link } from 'react-router-dom';
import { Lucide } from 'lucide-react';
import GraphPerformance from '../components/GraphPerformance';
import AllocationChart from '../components/AllocationChart';
import HoldingsList from '../components/HoldingsList';

const Portfolio = () => {
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Portfolio</h1>
        <Link to="/dashboard" className="btn">
          <Lucide icon="arrow-left" />
          Retour
        </Link>
      </header>
      <main className="main">
        <GraphPerformance />
        <section className="allocation">
          <h2 className="title">Allocation</h2>
          <AllocationChart />
        </section>
        <section className="holdings">
          <h2 className="title">Holdings</h2>
          <HoldingsList />
        </section>
        <section className="stats">
          <h2 className="title">Stats</h2>
          <p className="total-value">Total Value: $100,000</p>
          <p className="best-performer">Meilleur performer: +10%</p>
          <p className="worst-performer">Pire performer: -5%</p>
          <p className="beta">Beta: 1.2</p>
        </section>
      </main>
    </div>
  );
};

export default Portfolio;