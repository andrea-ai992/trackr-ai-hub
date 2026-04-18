**src/csp.js**
```javascript
import { Helmet } from 'react-helmet';

const cspHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm;
    style-src 'self' https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm;
    font-src 'self' https://fonts.googleapis.com;
    img-src 'self' https://images.unsplash.com https://images.unsplash.com;
    connect-src 'self' https://trackr-app-nu.vercel.app;
    object-src 'none';
    frame-src 'none';
    upgrade-insecure-requests;
  `,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer',
};

export default function CSP() {
  return (
    <Helmet>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#00ff88" />
      <meta name="msapplication-TileColor" content="#00ff88" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="Trackr" />
      <meta name="apple-mobile-web-app-title" content="Trackr" />
      <meta name="mobile-web-app-capable" content="yes" />
      <link
        rel="apple-touch-icon"
        sizes="57x57"
        href="/apple-icon-57x57.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/apple-icon-60x60.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="72x72"
        href="/apple-icon-72x72.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/apple-icon-76x76.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/apple-icon-114x114.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/apple-icon-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/apple-icon-144x144.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/apple-icon-152x152.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="manifest"
        href="/manifest.json"
      />
      <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
      <meta name="theme-color" content="#080808" />
      <meta name="msapplication-TileColor" content="#080808" />
      {Object.keys(cspHeaders).map((key) => (
        <meta key={key} name={key} content={cspHeaders[key]} />
      ))}
    </Helmet>
  );
}
```

**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet';
import CSP from './csp';
import App from './App';

ReactDOM.render(
  <HelmetProvider>
    <CSP />
    <Router>
      <App />
    </Router>
  </HelmetProvider>,
  document.getElementById('root')
);
```

**styles/globals.css**
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
}

.dark-mode {
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--green);
  color: var(--t1);
}
```

**styles/variables.css**
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