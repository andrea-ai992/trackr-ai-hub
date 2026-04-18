Création de la fonction de validation pour les paramètres query

```javascript
// src/utils/validateQuery.js
import { validate } from 'uuid';

const validateQuery = (query) => {
  const requiredFields = ['id', 'limit', 'offset'];
  const optionalFields = ['sort', 'order'];

  requiredFields.forEach((field) => {
    if (!query[field]) {
      throw new Error(`Le champ ${field} est requis.`);
    }
  });

  if (query.limit && query.limit !== 'all') {
    if (!validate(query.limit)) {
      throw new Error('La valeur de limit doit être un UUID ou "all".');
    }
  }

  if (query.offset && !validate(query.offset)) {
    throw new Error('La valeur de offset doit être un UUID.');
  }

  if (query.sort && query.order) {
    if (!['asc', 'desc'].includes(query.order)) {
      throw new Error('La valeur de order doit être "asc" ou "desc".');
    }
  }
};

export default validateQuery;
```

Création de la fonction de validation pour les paramètres body

```javascript
// src/utils/validateBody.js
import { validate } from 'uuid';

const validateBody = (body) => {
  const requiredFields = ['name', 'description'];
  const optionalFields = ['tags', 'category'];

  requiredFields.forEach((field) => {
    if (!body[field]) {
      throw new Error(`Le champ ${field} est requis.`);
    }
  });

  if (body.tags) {
    if (!Array.isArray(body.tags)) {
      throw new Error('Les tags doivent être un tableau.');
    }
  }

  if (body.category) {
    if (!['sport', 'finance', 'news', 'autres'].includes(body.category)) {
      throw new Error('La catégorie doit être "sport", "finance", "news" ou "autres".');
    }
  }
};

export default validateBody;
```

Modification du fichier de route pour utiliser les fonctions de validation

```javascript
// src/routes/More.js
import { Router, Route, useLocation } from 'react-router-dom';
import { validateQuery, validateBody } from '../utils/validateQuery';
import { validateBody as validateBodyMore } from '../utils/validateBody';
import More from '../pages/More';

const MoreRoute = () => {
  const location = useLocation();

  const query = new URLSearchParams(location.search).toString();
  const body = location.state;

  try {
    validateQuery(query);
  } catch (error) {
    return <div>Erreur de validation de query</div>;
  }

  try {
    validateBody(body);
  } catch (error) {
    return <div>Erreur de validation de body</div>;
  }

  return <More query={query} body={body} />;
};

export default MoreRoute;
```

Modification du fichier de page pour utiliser les fonctions de validation

```javascript
// src/pages/More.js
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { validateQuery, validateBody } from '../utils/validateQuery';
import { validateBody as validateBodyMore } from '../utils/validateBody';
import axios from 'axios';

const More = ({ query, body }) => {
  const [data, setData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.example.com/data?${query}`);
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [query]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://api.example.com/data', body);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Plus</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nom :
          <input type="text" name="name" value={body.name} onChange={(event) => (body.name = event.target.value)} />
        </label>
        <label>
          Description :
          <input type="text" name="description" value={body.description} onChange={(event) => (body.description = event.target.value)} />
        </label>
        <label>
          Tags :
          <input type="text" name="tags" value={body.tags} onChange={(event) => (body.tags = event.target.value.split(','))} />
        </label>
        <label>
          Catégorie :
          <select name="category" value={body.category} onChange={(event) => (body.category = event.target.value)}>
            <option value="sport">Sport</option>
            <option value="finance">Finance</option>
            <option value="news">News</option>
            <option value="autres">Autres</option>
          </select>
        </label>
        <button type="submit">Soumettre</button>
      </form>
      {data && <p>{data}</p>}
    </div>
  );
};

export default More;
```

Modification du fichier de route pour utiliser les fonctions de validation

```javascript
// src/routes/More.js
import { Router, Route, useLocation } from 'react-router-dom';
import MoreRoute from './MoreRoute';

const MoreRoute = () => {
  const location = useLocation();

  const query = new URLSearchParams(location.search).toString();
  const body = location.state;

  try {
    validateQuery(query);
  } catch (error) {
    return <div>Erreur de validation de query</div>;
  }

  try {
    validateBodyMore(body);
  } catch (error) {
    return <div>Erreur de validation de body</div>;
  }

  return <More query={query} body={body} />;
};

export default MoreRoute;
```

Modification du fichier de page pour utiliser les fonctions de validation

```javascript
// src/pages/More.js
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { validateQuery, validateBody } from '../utils/validateQuery';
import { validateBody as validateBodyMore } from '../utils/validateBody';
import axios from 'axios';

const More = ({ query, body }) => {
  const [data, setData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.example.com/data?${query}`);
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [query]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://api.example.com/data', body);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Plus</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nom :
          <input type="text" name="name" value={body.name} onChange={(event) => (body.name = event.target.value)} />
        </label>
        <label>
          Description :
          <input type="text" name="description" value={body.description} onChange={(event) => (body.description = event.target.value)} />
        </label>
        <label>
          Tags :
          <input type="text" name="tags" value={body.tags} onChange={(event) => (body.tags = event.target.value.split(','))} />
        </label>
        <label>
          Catégorie :
          <select name="category" value={body.category} onChange={(event) => (body.category = event.target.value)}>
            <option value="sport">Sport</option>
            <option value="finance">Finance</option>
            <option value="news">News</option>
            <option value="autres">Autres</option>
          </select>
        </label>
        <button type="submit">Soumettre</button>
      </form>
      {data && <p>{data}</p>}
    </div>
  );
};

export default More;