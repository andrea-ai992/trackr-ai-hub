Créer le fichier src/components/FlightTracker/FlightTracker.js

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'react-jss';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const styles = {
  container: {
    backgroundColor: ({ theme }) => theme.bg,
    color: ({ theme }) => theme.t1,
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    color: ({ theme }) => theme.t2,
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  flightInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: ({ theme }) => theme.bg2,
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
  },
  flightNumber: {
    fontSize: '18px',
    color: ({ theme }) => theme.t3,
    marginBottom: '10px',
  },
  flightStatus: {
    fontSize: '18px',
    color: ({ theme }) => theme.t3,
    marginBottom: '10px',
  },
  flightDestination: {
    fontSize: '18px',
    color: ({ theme }) => theme.t3,
    marginBottom: '10px',
  },
  button: {
    backgroundColor: ({ theme }) => theme.green,
    color: ({ theme }) => theme.t1,
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: ({ theme }) => theme.bg,
    },
  },
};

const FlightTracker = () => {
  const theme = useTheme();
  const classes = styles;

  return (
    <div className={`${classes.container} ${inter.className}`}>
      <h2 className={classes.title}>Flight Tracker</h2>
      <div className={classes.flightInfo}>
        <p className={classes.flightNumber}>Flight Number: 1234</p>
        <p className={classes.flightStatus}>Flight Status: Departed</p>
        <p className={classes.flightDestination}>Destination: Paris</p>
        <Link to="/flight-details" className={classes.button}>
          View Flight Details
        </Link>
      </div>
    </div>
  );
};

export default FlightTracker;
```

Créer le fichier src/components/FlightTracker/FlightTracker.module.css

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

.container {
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 24px;
  color: var(--t2);
  font-weight: bold;
  margin-bottom: 10px;
}

.flightInfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg2);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.flightNumber {
  font-size: 18px;
  color: var(--t3);
  margin-bottom: 10px;
}

.flightStatus {
  font-size: 18px;
  color: var(--t3);
  margin-bottom: 10px;
}

.flightDestination {
  font-size: 18px;
  color: var(--t3);
  margin-bottom: 10px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--bg);
  }
}