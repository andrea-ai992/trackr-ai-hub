**src/utils/inputSanitizer.js**
```javascript
import { createDOMPurify } from 'dompurify';

const DOMPurify = createDOMPurify();

const sanitizeInput = (input) => {
  const sanitizedInput = DOMPurify.sanitize(input);
  return sanitizedInput;
};

const validateQueryParams = (params) => {
  const allowedParams = ['name', 'message'];
  const validatedParams = {};

  Object.keys(params).forEach((param) => {
    if (allowedParams.includes(param)) {
      validatedParams[param] = params[param];
    }
  });

  return validatedParams;
};

export { sanitizeInput, validateQueryParams };
```

**src/components/Andy.js**
```javascript
import React from 'react';
import { useLocation } from 'react-router-dom';
import { sanitizeInput, validateQueryParams } from '../utils/inputSanitizer';

const Andy = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const validatedParams = validateQueryParams(queryParams);

  const name = validatedParams.name;
  const message = validatedParams.message;

  const sanitizedMessage = sanitizeInput(message);

  return (
    <div className="andy-container">
      <h1 className="andy-title">Andy</h1>
      <p className="andy-message">{sanitizedMessage}</p>
      <p className="andy-name">Bonjour, {name}</p>
    </div>
  );
};

export default Andy;
```

**src/pages/Andy.js**
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import Andy from '../components/Andy';

const AndyPage = () => {
  const params = useParams();

  return (
    <div className="andy-page">
      <Andy />
    </div>
  );
};

export default AndyPage;
```

**src/pages/Andy/index.js**
```javascript
import React from 'react';
import { Route, Link } from 'react-router-dom';
import AndyPage from './AndyPage';

const Andy = () => {
  return (
    <div className="andy-index">
      <h1 className="andy-index-title">Andy</h1>
      <p className="andy-index-message">Bienvenue sur la page d'Andy</p>
      <Link to="/andy?name=Andrea&message=Bonjour%20Andrea!">
        Accéder à la page d'Andy
      </Link>
      <Route path="/andy" element={<AndyPage />} />
    </div>
  );
};

export default Andy;
```

**src/pages/Andy/index.css**
```css
.andy-index {
  background-color: var(--bg);
  padding: 20px;
}

.andy-index-title {
  color: var(--t1);
  font-size: 24px;
}

.andy-index-message {
  color: var(--t2);
  font-size: 18px;
}

.andy-index-link {
  color: var(--green);
  text-decoration: none;
}

.andy-index-link:hover {
  color: var(--green);
  text-decoration: underline;
}
```

**src/components/Andy/index.css**
```css
.andy-container {
  background-color: var(--bg2);
  padding: 20px;
}

.andy-title {
  color: var(--t1);
  font-size: 24px;
}

.andy-message {
  color: var(--t2);
  font-size: 18px;
}

.andy-name {
  color: var(--t3);
  font-size: 18px;
}
```

**src/pages/AndyPage/index.js**
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import Andy from '../components/Andy';

const AndyPage = () => {
  const params = useParams();

  return (
    <div className="andy-page">
      <Andy />
    </div>
  );
};

export default AndyPage;
```

**src/pages/AndyPage/index.css**
```css
.andy-page {
  background-color: var(--bg);
  padding: 20px;
}