Création du fichier src/api/erreur.js

```javascript
import { SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabase = new SupabaseClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const handleFetchError = async (error, url, method, data) => {
  try {
    const { data: errorData, error: supabaseError } = await supabase
      .from('erreurs')
      .insert({
        url,
        method,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

    if (supabaseError) {
      console.error('Erreur lors de l\'enregistrement de l\'erreur:', supabaseError);
    }

    return errorData;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
  }
};

const useFetchErrorHandler = (fetchFunction) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleFetch = async (...args) => {
      try {
        const response = await fetchFunction(...args);
        return response;
      } catch (error) {
        setError(error);
        return handleFetchError(error, ...args);
      }
    };

    return handleFetch;
  }, [fetchFunction]);

  return [error, handleFetch];
};

export default useFetchErrorHandler;
```

Création du fichier src/api/erreur.css

```css
.erreur {
  background-color: var(--bg);
  color: var(--t1);
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.erreur__title {
  font-size: 18px;
  font-weight: bold;
  color: var(--t2);
  margin-bottom: 8px;
}

.erreur__message {
  font-size: 16px;
  color: var(--t3);
  margin-bottom: 16px;
}

.erreur__timestamp {
  font-size: 14px;
  color: var(--t3);
}
```

Modification du fichier src/components/ErrorBoundary.js pour utiliser le nouveau composant de gestion des erreurs

```javascript
import React, { useState, useEffect } from 'react';
import useFetchErrorHandler from '../api/erreur';

const ErrorBoundary = ({ children }) => {
  const [error, handleFetch] = useFetchErrorHandler(fetch);

  useEffect(() => {
    if (error) {
      console.error('Erreur:', error);
    }
  }, [error]);

  if (error) {
    return (
      <div className="erreur">
        <h2 className="erreur__title">Erreur</h2>
        <p className="erreur__message">{error.message}</p>
        <p className="erreur__timestamp">{error.timestamp}</p>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
```

Modification du fichier src/components/Fetch.js pour utiliser le nouveau composant de gestion des erreurs

```javascript
import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

const Fetch = ({ url, method, data }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleFetch = async () => {
      try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const data = await response.json();
        setResponse(data);
      } catch (error) {
        setError(error);
      }
    };

    handleFetch();
  }, [url, method, data]);

  return (
    <ErrorBoundary>
      {response && <div>{response}</div>}
      {error && <div>Erreur</div>}
    </ErrorBoundary>
  );
};

export default Fetch;