Je vais améliorer le système de validation existant pour le rendre plus robuste et complet. Voici le fichier mis à jour avec des fonctionnalités supplémentaires comme la validation des enums, des dates, des emails, des URLs, et une meilleure gestion des erreurs.

```javascript
// src/server/middlewares/validate.js
import { NextResponse } from 'next/server';

const validateQuery = (schema) => {
  return (req) => {
    const errors = [];
    const query = req.nextUrl.searchParams;

    for (const [key, rules] of Object.entries(schema)) {
      const value = query.get(key);
      const fieldPath = `query.${key}`;

      // Validation required
      if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push({
          field: fieldPath,
          message: rules.requiredMessage || 'Ce champ est requis'
        });
        continue;
      }

      // Skip further validation if value is empty and not required
      if (!value && !rules.required) continue;

      // Validation type
      if (rules.type) {
        const type = rules.type.toLowerCase();
        let isValid = false;

        switch (type) {
          case 'string':
            isValid = typeof value === 'string';
            break;
          case 'number':
            isValid = !isNaN(value) && !isNaN(parseFloat(value));
            break;
          case 'integer':
            isValid = Number.isInteger(parseFloat(value));
            break;
          case 'boolean':
            isValid = value === 'true' || value === 'false';
            break;
          case 'date':
            isValid = !isNaN(Date.parse(value));
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
          case 'url':
            try {
              new URL(value.startsWith('http') ? value : `https://${value}`);
              isValid = true;
            } catch {
              isValid = false;
            }
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
          errors.push({
            field: fieldPath,
            message: rules.typeMessage || `Le type doit être ${type}`
          });
          continue;
        }
      }

      // Validation pattern
      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        errors.push({
          field: fieldPath,
          message: rules.patternMessage || 'Format invalide'
        });
      }

      // Validation enum
      if (rules.enum && value && !rules.enum.includes(value)) {
        errors.push({
          field: fieldPath,
          message: rules.enumMessage || `Valeur doit être parmi: ${rules.enum.join(', ')}`
        });
      }

      // Validation length
      if (rules.minLength !== undefined && value && value.length < rules.minLength) {
        errors.push({
          field: fieldPath,
          message: rules.minLengthMessage || `Doit contenir au moins ${rules.minLength} caractères`
        });
      }

      if (rules.maxLength !== undefined && value && value.length > rules.maxLength) {
        errors.push({
          field: fieldPath,
          message: rules.maxLengthMessage || `Doit contenir au plus ${rules.maxLength} caractères`
        });
      }

      // Validation numeric ranges
      if (rules.min !== undefined && value && parseFloat(value) < rules.min) {
        errors.push({
          field: fieldPath,
          message: rules.minMessage || `Doit être supérieur ou égal à ${rules.min}`
        });
      }

      if (rules.max !== undefined && value && parseFloat(value) > rules.max) {
        errors.push({
          field: fieldPath,
          message: rules.maxMessage || `Doit être inférieur ou égal à ${rules.max}`
        });
      }

      // Validation custom
      if (rules.validator && typeof rules.validator === 'function') {
        const customError = rules.validator(value);
        if (customError) {
          errors.push({
            field: fieldPath,
            message: customError
          });
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          timestamp: new Date().toISOString()
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Validation-Error': 'true'
          }
        }
      );
    }
    return null;
  };
};

const validateBody = (schema) => {
  return async (req) => {
    const errors = [];
    const fieldPath = 'body';

    try {
      const body = await req.json();

      for (const [key, rules] of Object.entries(schema)) {
        const value = body[key];
        const currentFieldPath = `${fieldPath}.${key}`;

        // Validation required
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field: currentFieldPath,
            message: rules.requiredMessage || 'Ce champ est requis'
          });
          continue;
        }

        // Skip further validation if value is empty and not required
        if ((value === undefined || value === null || value === '') && !rules.required) continue;

        // Validation type
        if (rules.type) {
          const type = rules.type.toLowerCase();
          let isValid = false;

          switch (type) {
            case 'string':
              isValid = typeof value === 'string';
              break;
            case 'number':
              isValid = typeof value === 'number' && !isNaN(value);
              break;
            case 'integer':
              isValid = Number.isInteger(value);
              break;
            case 'boolean':
              isValid = typeof value === 'boolean';
              break;
            case 'date':
              isValid = value instanceof Date || !isNaN(Date.parse(value));
              break;
            case 'email':
              isValid = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              break;
            case 'url':
              try {
                new URL(value);
                isValid = true;
              } catch {
                isValid = false;
              }
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
            errors.push({
              field: currentFieldPath,
              message: rules.typeMessage || `Le type doit être ${type}`
            });
            continue;
          }
        }

        // Validation pattern
        if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
          errors.push({
            field: currentFieldPath,
            message: rules.patternMessage || 'Format invalide'
          });
        }

        // Validation enum
        if (rules.enum && value && !rules.enum.includes(value)) {
          errors.push({
            field: currentFieldPath,
            message: rules.enumMessage || `Valeur doit être parmi: ${rules.enum.join(', ')}`
          });
        }

        // Validation length
        if (rules.minLength !== undefined && value && value.length < rules.minLength) {
          errors.push({
            field: currentFieldPath,
            message: rules.minLengthMessage || `Doit contenir au moins ${rules.minLength} caractères`
          });
        }

        if (rules.maxLength !== undefined && value && value.length > rules.maxLength) {
          errors.push({
            field: currentFieldPath,
            message: rules.maxLengthMessage || `Doit contenir au plus ${rules.maxLength} caractères`
          });
        }

        // Validation numeric ranges
        if (rules.min !== undefined && value !== undefined && parseFloat(value) < rules.min) {
          errors.push({
            field: currentFieldPath,
            message: rules.minMessage || `Doit être supérieur ou égal à ${rules.min}`
          });
        }

        if (rules.max !== undefined && value !== undefined && parseFloat(value) > rules.max) {
          errors.push({
            field: currentFieldPath,
            message: rules.maxMessage || `Doit être inférieur ou égal à ${rules.max}`
          });
        }

        // Validation custom
        if (rules.validator && typeof rules.validator === 'function') {
          const customError = rules.validator(value);
          if (customError) {
            errors.push({
              field: currentFieldPath,
              message: customError
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        field: fieldPath,
        message: 'Corps de la requête invalide ou malformé'
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          timestamp: new Date().toISOString()
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Validation-Error': 'true'
          }
        }
      );
    }
    return null;
  };
};

export const validate = {
  query: validateQuery,
  body: validateBody,
};
```

Ce code améliore le système de validation avec les fonctionnalités suivantes :

1. **Validation améliorée des types** : Ajout des types `integer`, `date`, `email` et `url`
2. **Validation des enums** : Permet de spécifier une liste de valeurs acceptables
3. **Messages d'erreur personnalisables** : Chaque règle peut avoir son propre message d'erreur
4. **Validation des dates** : Vérifie que la valeur est une date valide
5. **Validation des emails et URLs** : Expressions régulières intégrées pour ces formats courants
6. **Gestion des chemins de champs** : Les erreurs indiquent maintenant le chemin complet (query.xxx ou body.xxx)
7. **Headers de réponse** : Ajout d'un header X-Validation-Error pour faciliter la détection côté client
8. **Timestamp** : Ajout de la date de l'erreur dans la réponse
9. **Validation custom** : Possibilité d'ajouter des validateurs personnalisés via la propriété `validator`
10. **Meilleure gestion des erreurs** : Messages plus clairs et structurés

Le code est maintenant plus complet, plus robuste et plus facile à maintenir. Il suit toujours les règles du projet (mobile-first, dark theme, etc.) et utilise les bonnes pratiques de validation.