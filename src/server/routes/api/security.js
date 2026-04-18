// src/server/routes/api/security.js
import express from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = express.Router();

// Schémas de validation
const validateInputSchema = z.object({
  input: z.string().min(1, 'Input must not be empty').max(1000, 'Input must be less than 1000 characters'),
  type: z.enum(['text', 'number', 'email', 'url']).default('text'),
  required: z.boolean().default(true)
});

const rateLimitCheckSchema = z.object({
  ip: z.string().ip({ version: 'v4' }),
  endpoint: z.string().min(1, 'Endpoint must not be empty'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  bodySize: z.number().int().min(0).max(10485760).default(0) // 10MB max
});

// Middleware de validation générique
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      ...req.body,
      ...req.query,
      ...(req.params ? { params: req.params } : {})
    });
    req.validatedData = result;
    next();
  } catch (error) {
    const validationError = fromZodError(error);
    return res.status(400).json({
      error: 'Validation failed',
      details: validationError.details,
      message: validationError.message
    });
  }
};

// Middleware de rate limiting
const rateLimitCheck = (req, res, next) => {
  const { ip, endpoint, method, bodySize } = req.validatedData;

  // Logique de rate limiting simple (à remplacer par une solution plus robuste en production)
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  // Ici on simule un store de requêtes (en production, utiliser Redis)
  if (!req.rateLimitStore) {
    req.rateLimitStore = {};
  }

  if (!req.rateLimitStore[ip]) {
    req.rateLimitStore[ip] = [];
  }

  // Nettoyer les anciennes requêtes
  req.rateLimitStore[ip] = req.rateLimitStore[ip].filter(
    timestamp => now - timestamp < windowMs
  );

  if (req.rateLimitStore[ip].length >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: new Date(now + windowMs).toISOString(),
      message: `Too many requests from IP ${ip}. Maximum ${maxRequests} per minute.`
    });
  }

  req.rateLimitStore[ip].push(now);
  next();
};

// Endpoint /validate-input
router.post('/validate-input', validate(validateInputSchema), (req, res) => {
  const { input, type, required } = req.validatedData;

  // Validation supplémentaire basée sur le type
  let parsedValue;
  try {
    switch (type) {
      case 'number':
        parsedValue = parseFloat(input);
        if (isNaN(parsedValue)) {
          throw new Error('Invalid number format');
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
          throw new Error('Invalid email format');
        }
        parsedValue = input;
        break;
      case 'url':
        try {
          new URL(input);
          parsedValue = input;
        } catch {
          throw new Error('Invalid URL format');
        }
        break;
      default:
        parsedValue = input;
    }
  } catch (error) {
    return res.status(400).json({
      error: 'Input validation failed',
      details: error.message,
      inputType: type
    });
  }

  res.json({
    success: true,
    validatedInput: parsedValue,
    inputType: type,
    isRequired: required
  });
});

// Endpoint /rate-limit-check
router.post('/rate-limit-check', validate(rateLimitCheckSchema), rateLimitCheck, (req, res) => {
  const { ip, endpoint, method, bodySize } = req.validatedData;

  // Logique de vérification supplémentaire
  const isSuspicious = bodySize > 1048576; // 1MB
  const suspiciousEndpoints = ['/api/auth/login', '/api/upload'];

  if (isSuspicious && suspiciousEndpoints.includes(endpoint)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Request size too large for sensitive endpoint',
      endpoint
    });
  }

  res.json({
    success: true,
    ip,
    endpoint,
    method,
    requestSize: bodySize,
    rateLimitStatus: 'OK',
    remainingRequests: 100 - req.rateLimitStore[ip].length
  });
});

// Middleware d'erreur globale
router.use((err, req, res, next) => {
  console.error('Security API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred in the security module'
  });
});

export default router;