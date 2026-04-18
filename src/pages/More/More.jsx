Création de src/pages/More/More.jsx :

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoIosAirplane, IoIosWallet, IoIosLightbulb, IoIosBriefcase, IoIosChart, IoIosTrophy, IoIosGlobe, IoIosHome, IoIosSneaker, IoIosWatch } from 'lucide-react';
import { supabase } from '../supabaseClient';

const modules = [
  {
    id: 1,
    title: 'FlightTracker',
    description: 'Suivi des vols',
    icon: <IoIosAirplane />,
    badge: 'LIVE',
    link: '/flighttracker'
  },
  {
    id: 2,
    title: 'CryptoTrader',
    description: 'Trading de crypto-monnaies',
    icon: <IoIosWallet />,
    badge: 'NEW',
    link: '/cryptotrader'
  },
  {
    id: 3,
    title: 'Signals',
    description: 'Signaux de trading',
    icon: <IoIosLightbulb />,
    badge: 'PRO',
    link: '/signals'
  },
  {
    id: 4,
    title: 'Portfolio',
    description: 'Gestion de portfolio',
    icon: <IoIosBriefcase />,
    badge: 'LIVE',
    link: '/portfolio'
  },
  {
    id: 5,
    title: 'Patterns',
    description: 'Analyse de données',
    icon: <IoIosChart />,
    badge: 'NEW',
    link: '/patterns'
  },
  {
    id: 6,
    title: 'Sports',
    description: 'Suivi des sports',
    icon: <IoIosTrophy />,
    badge: 'PRO',
    link: '/sports'
  },
  {
    id: 7,
    title: 'Translator',
    description: 'Traducteur',
    icon: <IoIosGlobe />,
    badge: 'LIVE',
    link: '/translator'
  },
  {
    id: 8,
    title: 'RealEstate',
    description: 'Immobilier',
    icon: <IoIosHome />,
    badge: 'NEW',
    link: '/realestate'
  },
  {
    id: 9,
    title: 'Sneakers',
    description: 'Sneakers',
    icon: <IoIosSneaker />,
    badge: 'PRO',
    link: '/sneakers'
  },
  {
    id: 10,
    title: 'Watches',
    description: 'Montres',
    icon: <IoIosWatch />,
    badge: 'LIVE',
    link: '/watches'
  }
];

function More() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode === 'true';
  });

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <div className={`min-h-screen bg-${darkMode ? 'bg' : 'bg2'} p-4`}>
      <h1 className={`text-${darkMode ? 't1' : 't2'} text-2xl font-bold mb-4`}>Plus</h1>
      <div className="grid grid-cols-2 gap-4">
        {modules.map((module, index) => (
          <div key={module.id} className="bg-${darkMode ? 'bg3' : 'bg'} p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {module.icon}
                <h2 className={`text-${darkMode ? 't1' : 't2'} text-lg ml-2`}>{module.title}</h2>
              </div>
              <div className={`bg-${darkMode ? 'green' : 'green'} text-${darkMode ? 't1' : 't2'} text-sm px-2 py-1 rounded-lg`}>{module.badge}</div>
            </div>
            <p className={`text-${darkMode ? 't3' : 't3'} text-sm mb-2`}>{module.description}</p>
            <Link to={module.link} className={`text-${darkMode ? 't1' : 't2'} text-sm`}>Découvrir</Link>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className={`text-${darkMode ? 't2' : 't2'} text-sm mr-2`}>Mode sombre</label>
        <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} className={`mr-2`}/>
        <span className={`text-${darkMode ? 't2' : 't2'} text-sm`}>Version {process.env.REACT_APP_VERSION}</span>
      </div>
    </div>
  );
}

export default More;
```

Création de src/pages/More/index.jsx :

```jsx
import React from 'react';
import More from './More';

function Index() {
  return (
    <div>
      <More />
    </div>
  );
}

export default Index;
```

Ajout de la route dans src/routes.js :

```jsx
import { Route, Routes } from 'react-router-dom';
import Index from './pages/More';

const routes = [
  {
    path: '/more',
    element: <Index />
  }
];

export default routes;
```

Mise à jour de src/App.js pour inclure la route :

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;