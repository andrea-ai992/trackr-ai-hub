**Étape 10 : Mise en place des headers de sécurité CSP dans src/index.js**

Pour mettre en place les headers de sécurité CSP, nous allons ajouter les métadonnées nécessaires dans le fichier `src/index.js`.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const cspHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.development.js https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.development.js;
    style-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css;
    font-src 'self' https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap;
  `,
  'X-Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.development.js https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.development.js;
    style-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css;
    font-src 'self' https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap;
  `,
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

Object.keys(cspHeaders).forEach((key) => {
  document.getElementById('root').setAttribute(key, cspHeaders[key]);
});
```

Ces métadonnées définissent les sources autorisées pour les scripts, les styles et les polices de caractères. Les valeurs `'self'` autorisent les ressources provenant du même domaine que le site web, tandis que les valeurs `https://cdn.jsdelivr.net/npm/...` autorisent les ressources provenant des CDN de React et Bootstrap.

Enfin, nous ajoutons les métadonnées dans le fichier `index.html` pour les rendre accessibles au navigateur.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Trackr</title>
  <link rel="stylesheet" href="styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
</body>
</html>
```

Maintenant, les headers de sécurité CSP sont en place et les ressources externes sont autorisées en fonction des règles définies dans les métadonnées.