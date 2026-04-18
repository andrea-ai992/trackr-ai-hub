src/server/middlewares/validate.js
```javascript
import { NextResponse } from 'next/server';

const validateQuery = (schema) => {
  return (req) => {
    const errors = [];
    const query = req.nextUrl.searchParams;

    for (const [key, rules] of Object.entries(schema)) {
      const value = query.get(key);
      if (rules.required && !value) {
        errors.push({ field: key, message: 'Ce champ est requis' });
        continue;
      }
      if (value && rules.type) {
        const type = rules.type.toLowerCase();
        let isValid = false;
        switch (type) {
          case 'string':
            isValid = typeof value === 'string';
            break;
          case 'number':
            isValid = !isNaN(value) && !isNaN(parseFloat(value));
            break;
          case 'boolean':
            isValid = value === 'true' || value === 'false';
            break;
          case 'array':
            try {
              const parsed = JSON.parse(value);
              isValid = Array.isArray(parsed);
            } catch {
              isValid = false;
            }
            break;
          case 'object':
            try {
              JSON.parse(value);
              isValid = true;
            } catch {
              isValid = false;
            }
            break;
          default:
            isValid = true;
        }
        if (!isValid) {
          errors.push({ field: key, message: `Le type doit être ${type}` });
        }
        if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
          errors.push({ field: key, message: rules.patternMessage || 'Format invalide' });
        }
        if (rules.minLength && value && value.length < rules.minLength) {
          errors.push({ field: key, message: `Doit contenir au moins ${rules.minLength} caractères` });
        }
        if (rules.maxLength && value && value.length > rules.maxLength) {
          errors.push({ field: key, message: `Doit contenir au plus ${rules.maxLength} caractères` });
        }
        if (rules.min && value && parseFloat(value) < rules.min) {
          errors.push({ field: key, message: `Doit être supérieur ou égal à ${rules.min}` });
        }
        if (rules.max && value && parseFloat(value) > rules.max) {
          errors.push({ field: key, message: `Doit être inférieur ou égal à ${rules.max}` });
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }
    return null;
  };
};

const validateBody = (schema) => {
  return async (req) => {
    const errors = [];
    try {
      const body = await req.json();
      for (const [key, rules] of Object.entries(schema)) {
        const value = body[key];
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push({ field: key, message: 'Ce champ est requis' });
          continue;
        }
        if (value !== undefined && rules.type) {
          const type = rules.type.toLowerCase();
          let isValid = false;
          switch (type) {
            case 'string':
              isValid = typeof value === 'string';
              break;
            case 'number':
              isValid = typeof value === 'number' && !isNaN(value);
              break;
            case 'boolean':
              isValid = typeof value === 'boolean';
              break;
            case 'array':
              isValid = Array.isArray(value);
              break;
            case 'object':
              isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
              break;
            default:
              isValid = true;
          }
          if (!isValid) {
            errors.push({ field: key, message: `Le type doit être ${type}` });
          }
          if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
            errors.push({ field: key, message: rules.patternMessage || 'Format invalide' });
          }
          if (rules.minLength && value && value.length < rules.minLength) {
            errors.push({ field: key, message: `Doit contenir au moins ${rules.minLength} caractères` });
          }
          if (rules.maxLength && value && value.length > rules.maxLength) {
            errors.push({ field: key, message: `Doit contenir au plus ${rules.maxLength} caractères` });
          }
          if (rules.min && value !== undefined && parseFloat(value) < rules.min) {
            errors.push({ field: key, message: `Doit être supérieur ou égal à ${rules.min}` });
          }
          if (rules.max && value !== undefined && parseFloat(value) > rules.max) {
            errors.push({ field: key, message: `Doit être inférieur ou égal à ${rules.max}` });
          }
        }
      }
    } catch (error) {
      errors.push({ field: 'body', message: 'Corps de la requête invalide' });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }
    return null;
  };
};

export const validate = {
  query: validateQuery,
  body: validateBody,
};