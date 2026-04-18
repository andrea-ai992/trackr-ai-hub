**src/components/Andy.js**
```jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const Andy = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const handleInput = (event) => {
    const input = event.target.value;
    const sanitizedInput = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return sanitizedInput;
  };

  return (
    <div className="andy">
      <h1 className="title">Andy</h1>
      <form>
        <label>
          Entrez votre message :
          <input type="text" value={handleInput} onChange={(event) => handleInput(event)} />
        </label>
        <button type="submit">Envoyer</button>
      </form>
      <div className="output" dangerouslySetInnerHTML={{ __html: params.get('message') }} />
    </div>
  );
};

export default Andy;
```

**src/pages/Andy.js**
```jsx
import React from 'react';
import ReactRouterDOM from 'react-router-dom';
import Andy from '../components/Andy';

const AndyPage = () => {
  return (
    <div className="page andy-page">
      <h1 className="title">Page Andy</h1>
      <Andy />
    </div>
  );
};

export default AndyPage;
```

**src/pages/Andy.js (validation des paramètres query)**
```jsx
import React from 'react';
import ReactRouterDOM from 'react-router-dom';
import Andy from '../components/Andy';

const AndyPage = () => {
  const location = ReactRouterDOM.useLocation();
  const params = new URLSearchParams(location.search);

  const validateParams = () => {
    const allowedParams = ['message'];
    allowedParams.forEach((param) => {
      if (!params.has(param)) {
        throw new Error(`Le paramètre ${param} est obligatoire.`);
      }
    });
  };

  validateParams();

  return (
    <div className="page andy-page">
      <h1 className="title">Page Andy</h1>
      <Andy />
    </div>
  );
};

export default AndyPage;
```

**src/components/Andy.js (style)**
```css
.andy {
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  width: 100%;
}

button {
  padding: 10px 20px;
  background-color: var(--green);
  color: var(--t1);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: var(--green);
}

.output {
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  width: 100%;
}

.output pre {
  padding: 10px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  width: 100%;
}
```

**src/pages/Andy.js (style)**
```css
.page {
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.andy-page {
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}
```

**package.json**
```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.4.3",
    "lucide-react": "^0.3.2"
  }
}