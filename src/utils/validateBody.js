Création de la fonction de validation de corps de requête `validateBody.js` dans le dossier `src/utils/` :

```javascript
// src/utils/validateBody.js

import { NextApiRequest } from 'next';

const validateBody = (req: NextApiRequest, schema: any) => {
  const { body } = req;
  const { error } = schema.validate(body);
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
  return body;
};

const validateQuery = (req: NextApiRequest, schema: any) => {
  const { query } = req;
  const { error } = schema.validate(query);
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
  return query;
};

const validateString = (value: string, minLength: number, maxLength: number) => {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  if (value.length < minLength) {
    throw new Error(`Value must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    throw new Error(`Value must be at most ${maxLength} characters`);
  }
};

const validateNumber = (value: number, min: number, max: number) => {
  if (typeof value !== 'number') {
    throw new Error('Value must be a number');
  }
  if (value < min) {
    throw new Error(`Value must be at least ${min}`);
  }
  if (value > max) {
    throw new Error(`Value must be at most ${max}`);
  }
};

const validateBoolean = (value: boolean) => {
  if (typeof value !== 'boolean') {
    throw new Error('Value must be a boolean');
  }
};

export { validateBody, validateQuery, validateString, validateNumber, validateBoolean };
```

Création de la fonction de validation de schéma pour la page Trackr/More `validateMoreSchema.js` dans le dossier `src/utils/` :

```javascript
// src/utils/validateMoreSchema.js

import { z } from 'zod';
import { validateString, validateNumber, validateBoolean } from './validateBody';

const moreSchema = z.object({
  keyword: z.string().min(1, 'Keyword must be at least 1 character').max(255, 'Keyword must be at most 255 characters'),
  category: z.string().min(1, 'Category must be at least 1 character').max(255, 'Category must be at most 255 characters'),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100'),
  offset: z.number().min(0, 'Offset must be at least 0').max(1000, 'Offset must be at most 1000'),
  sortBy: z.string().min(1, 'Sort by must be at least 1 character').max(255, 'Sort by must be at most 255 characters'),
  orderBy: z.string().min(1, 'Order by must be at least 1 character').max(255, 'Order by must be at most 255 characters'),
  isAsc: z.boolean(),
});

export { moreSchema };
```

Modification du fichier `src/pages/More.tsx` pour utiliser les fonctions de validation :

```typescript
// src/pages/More.tsx

import { NextApiRequest } from 'next';
import { moreSchema } from '../utils/validateMoreSchema';
import { validateBody } from '../utils/validateBody';

const More = () => {
  const { query } = useRouter();
  const { keyword, category, limit, offset, sortBy, orderBy, isAsc } = query;

  const validateQuery = () => {
    try {
      const validatedQuery = validateBody(query, moreSchema);
      return validatedQuery;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const validatedQuery = validateQuery();

  return (
    <div className="container">
      <h1>More</h1>
      <p>Keyword: {validatedQuery?.keyword}</p>
      <p>Category: {validatedQuery?.category}</p>
      <p>Limit: {validatedQuery?.limit}</p>
      <p>Offset: {validatedQuery?.offset}</p>
      <p>Sort by: {validatedQuery?.sortBy}</p>
      <p>Order by: {validatedQuery?.orderBy}</p>
      <p>Is asc: {validatedQuery?.isAsc}</p>
    </div>
  );
};

export default More;
```

Modification du fichier `src/pages/More/[...params].tsx` pour utiliser les fonctions de validation :

```typescript
// src/pages/More/[...params].tsx

import { NextApiRequest } from 'next';
import { moreSchema } from '../utils/validateMoreSchema';
import { validateBody } from '../utils/validateBody';

const More = () => {
  const { params } = useRouter();
  const { keyword, category, limit, offset, sortBy, orderBy, isAsc } = params;

  const validateBody = () => {
    try {
      const validatedBody = validateBody(params, moreSchema);
      return validatedBody;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const validatedBody = validateBody();

  return (
    <div className="container">
      <h1>More</h1>
      <p>Keyword: {validatedBody?.keyword}</p>
      <p>Category: {validatedBody?.category}</p>
      <p>Limit: {validatedBody?.limit}</p>
      <p>Offset: {validatedBody?.offset}</p>
      <p>Sort by: {validatedBody?.sortBy}</p>
      <p>Order by: {validatedBody?.orderBy}</p>
      <p>Is asc: {validatedBody?.isAsc}</p>
    </div>
  );
};

export default More;