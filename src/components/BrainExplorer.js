**src/components/BrainExplorer.js**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Inter } from '@lucide-react/inter';
import styles from './BrainExplorer.module.css';

const BrainExplorer = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Brain Explorer</h1>
        <nav className={styles.nav}>
          <ul className={styles.list}>
            <li className={styles.item}>
              <Link to="/brain-explorer/brainwaves" className={styles.link}>
                Brainwaves
              </Link>
            </li>
            <li className={styles.item}>
              <Link to="/brain-explorer/neuroplasticity" className={styles.link}>
                Neuroplasticity
              </Link>
            </li>
            <li className={styles.item}>
              <Link to="/brain-explorer/cognitive-bias" className={styles.link}>
                Cognitive Bias
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.subtitle}>Brainwaves</h2>
          <p className={styles.paragraph}>
            Brainwaves are a type of electrical activity in the brain that can be measured using electroencephalography (EEG).
          </p>
          <button className={styles.button}>Learn More</button>
        </section>
        <section className={styles.section}>
          <h2 className={styles.subtitle}>Neuroplasticity</h2>
          <p className={styles.paragraph}>
            Neuroplasticity is the brain's ability to change and adapt throughout life.
          </p>
          <button className={styles.button}>Learn More</button>
        </section>
        <section className={styles.section}>
          <h2 className={styles.subtitle}>Cognitive Bias</h2>
          <p className={styles.paragraph}>
            Cognitive bias is a systematic error in thinking that affects the way we perceive and process information.
          </p>
          <button className={styles.button}>Learn More</button>
        </section>
      </main>
      <footer className={styles.footer}>
        <p className={styles.copyright}>
          &copy; 2023 Brain Explorer. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default BrainExplorer;
```

**src/styles/global.css**
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

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 0;
  margin: 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
  background-color: var(--bg);
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}

.nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  margin-bottom: 10px;
}

.link {
  text-decoration: none;
  color: var(--t2);
}

.link:hover {
  color: var(--green);
}

.main {
  padding: 20px;
}

.section {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--t2);
}

.paragraph {
  margin-bottom: 20px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--green);
  color: var(--t1);
}

.footer {
  background-color: var(--bg);
  padding: 20px;
  border-top: 1px solid var(--border);
}

.copyright {
  font-size: 14px;
  color: var(--t3);
}
```

**src/components/BrainExplorer.module.css**
```css
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
  background-color: var(--bg);
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}

.nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  margin-bottom: 10px;
}

.link {
  text-decoration: none;
  color: var(--t2);
}

.link:hover {
  color: var(--green);
}

.main {
  padding: 20px;
}

.section {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--t2);
}

.paragraph {
  margin-bottom: 20px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--green);
  color: var(--t1);
}