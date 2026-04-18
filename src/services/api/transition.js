Création de la fonction de transition de page dans src/services/api/transition.js

```javascript
import { useEffect, useState } from 'react';

const transition = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleTransition = () => {
      setAnimate(true);
      setTimeout(() => {
        setAnimate(false);
      }, 340);
    };

    document.addEventListener('visibilitychange', handleTransition);
    document.addEventListener('scroll', handleTransition);

    return () => {
      document.removeEventListener('visibilitychange', handleTransition);
      document.removeEventListener('scroll', handleTransition);
    };
  }, []);

  return animate;
};

export default transition;
```

Création du composant de transition de page dans src/components/Transition.js

```javascript
import React from 'react';
import transition from '../services/api/transition';
import styles from './Transition.module.css';

const Transition = () => {
  const animate = transition();

  return (
    <div
      className={`${styles.transition} ${
        animate ? styles.animate : ''
      }`}
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--t1)',
        border: `1px solid var(--border)`,
        padding: '10px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h2 className={styles.title}>En cours de chargement...</h2>
      <p className={styles.message}>Veuillez patienter...</p>
    </div>
  );
};

export default Transition;
```

Création du module CSS pour la transition de page dans src/components/Transition.module.css

```css
.transition {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 300px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-family: 'Inter', sans-serif;
}

.transition.animate {
  animation: fadeIn 340ms;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: var(--green);
  margin-bottom: 10px;
}

.message {
  font-size: 14px;
  color: var(--t2);
}
```

Création du composant de page principale avec la transition de page dans src/pages/Home.js

```javascript
import React from 'react';
import Transition from '../components/Transition';

const Home = () => {
  return (
    <div>
      <Transition />
      {/* Contenu de la page principale */}
    </div>
  );
};

export default Home;
```

Création du composant de page avec la transition de page dans src/pages/About.js

```javascript
import React from 'react';
import Transition from '../components/Transition';

const About = () => {
  return (
    <div>
      <Transition />
      {/* Contenu de la page About */}
    </div>
  );
};

export default About;