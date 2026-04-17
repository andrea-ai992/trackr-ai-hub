Je vais générer tous les fichiers demandés pour renforcer la sécurité XSS.

---

FILE: src/utils/sanitize.ts

import DOMPurify from 'dompurify';

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,
  /vbscript\s*:/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*javascript/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|CAST|CONVERT)\b)/gi,
  /(--|;|\/\*|\*\/)/g,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
];

export interface SanitizeOptions {
  maxLength?: number;
  allowHTML?: boolean;
  stripTags?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

const defaultDOMPurifyConfig: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'style', 'href', 'src'],
  FORCE_BODY: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

export function sanitizeInput(input: unknown, options: SanitizeOptions = {}): string {
  if (input === null || input === undefined) return '';

  let value = String(input);

  const maxLength = options.maxLength ?? 10000;
  if (value.length > maxLength) {
    value = value.slice(0, maxLength);
  }

  value = value.replace(/\0/g, '');

  value = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');

  XSS_PATTERNS.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  value = value.trim();

  return value;
}

export function sanitizeHTML(html: unknown, options: SanitizeOptions = {}): string {
  if (html === null || html === undefined) return '';

  let value = String(html);

  const maxLength = options.maxLength ?? 50000;
  if (value.length > maxLength) {
    value = value.slice(0, maxLength);
  }

  value = value.replace(/\0/g, '');

  let purifyConfig: DOMPurify.Config = { ...defaultDOMPurifyConfig };

  if (options.allowedTags && options.allowedTags.length > 0) {
    purifyConfig = {
      ...purifyConfig,
      ALLOWED_TAGS: options.allowedTags,
    };
  }

  if (options.allowedAttributes) {
    const allowedAttr: string[] = [];
    Object.values(options.allowedAttributes).forEach((attrs) => {
      attrs.forEach((attr) => {
        if (!allowedAttr.includes(attr)) {
          allowedAttr.push(attr);
        }
      });
    });
    purifyConfig = {
      ...purifyConfig,
      ALLOWED_ATTR: allowedAttr,
    };
  }

  if (options.stripTags) {
    purifyConfig = {
      ...purifyConfig,
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    };
  }

  const sanitized = DOMPurify.sanitize(value, purifyConfig);

  return typeof sanitized === 'string' ? sanitized : '';
}

export function sanitizeUsername(username: unknown): string {
  if (username === null || username === undefined) return '';

  let value = String(username);

  value = value.replace(/[^a-zA-Z0-9_\-\.@]/g, '');

  value = value.slice(0, 50);

  return value.trim();
}

export function sanitizeNote(note: unknown, options: SanitizeOptions = {}): string {
  if (note === null || note === undefined) return '';

  const maxLength = options.maxLength ?? 5000;
  let value = String(note).slice(0, maxLength);

  value = value.replace(/\0/g, '');

  value = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');

  XSS_PATTERNS.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  return value.trim();
}

export function sanitizeTrackingData(data: unknown): string {
  if (data === null || data === undefined) return '';

  let value = String(data);

  value = value.replace(/[^\w\s\-_.,@#:\/\(\)\[\]{}%+!?&=]/g, '');

  SQL_INJECTION_PATTERNS.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  XSS_PATTERNS.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  return value.trim().slice(0, 2000);
}

export function validateEmail(email: unknown): { isValid: boolean; sanitized: string; error?: string } {
  if (email === null || email === undefined || email === '') {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }

  let value = String(email).trim().toLowerCase();

  value = value.replace(/[<>"'`\0]/g, '');

  if (value.length > 254) {
    return { isValid: false, sanitized: '', error: 'Email exceeds maximum length of 254 characters' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(value)) {
    return { isValid: false, sanitized: '', error: 'Invalid email format' };
  }

  const parts = value.split('@');
  if (parts.length !== 2) {
    return { isValid: false, sanitized: '', error: 'Invalid email format' };
  }

  const [localPart, domain] = parts;

  if (localPart.length > 64) {
    return { isValid: false, sanitized: '', error: 'Email local part exceeds maximum length' };
  }

  if (domain.length > 253) {
    return { isValid: false, sanitized: '', error: 'Email domain exceeds maximum length' };
  }

  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return { isValid: false, sanitized: '', error: 'Invalid domain in email' };
  }

  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { isValid: false, sanitized: '', error: 'Invalid domain format' };
  }

  XSS_PATTERNS.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  return { isValid: true, sanitized: value };
}

export function validateURL(url: unknown): { isValid: boolean; sanitized: string; error?: string } {
  if (url === null || url === undefined || url === '') {
    return { isValid: false, sanitized: '', error: 'URL is required' };
  }

  let value = String(url).trim();

  if (value.length > 2048) {
    return { isValid: false, sanitized: '', error: 'URL exceeds maximum length' };
  }

  const dangerousProtocols = /^(javascript|vbscript|data|file|ftp):/i;
  if (dangerousProtocols.test(value)) {
    return { isValid: false, sanitized: '', error: 'Dangerous URL protocol detected' };
  }

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, sanitized: '', error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    return { isValid: true, sanitized: parsed.toString() };
  } catch {
    return { isValid: false, sanitized: '', error: 'Invalid URL format' };
  }
}

export function validateRequired(value: unknown, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function validateMinLength(value: unknown, min: number, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  const str = String(value ?? '');
  if (str.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters long` };
  }
  return { isValid: true };
}

export function validateMaxLength(value: unknown, max: number, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  const str = String(value ?? '');
  if (str.length > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
  }
  return { isValid: true };
}

export function validateAlphanumeric(value: unknown, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  const str = String(value ?? '');
  if (!/^[a-zA-Z0-9_\-]+$/.test(str)) {
    return { isValid: false, error: `${fieldName} can only contain letters, numbers, underscores, and hyphens` };
  }
  return { isValid: true };
}

export function containsXSS(value: string): boolean {
  const testPatterns = [
    /<script/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /data\s*:\s*text\/html/gi,
    /<iframe/gi,
    /expression\s*\(/gi,
    /vbscript\s*:/gi,
  ];
  return testPatterns.some((pattern) => pattern.test(value));
}

export function containsSQLInjection(value: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeUsername,
  sanitizeNote,
  sanitizeTrackingData,
  validateEmail,
  validateURL,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateAlphanumeric,
  containsXSS,
  containsSQLInjection,
};

---

FILE: src/components/Dashboard.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { sanitizeInput, sanitizeUsername, validateEmail, containsXSS } from '../utils/sanitize';

const MOCK_STATS = {
  totalTracked: 1247,
  activeToday: 89,
  completedTasks: 342,
  pendingReview: 23,
};

const MOCK_ACTIVITIES = [
  { id: 1, type: 'tracking', message: 'New tracking entry added', timestamp: '2 min ago', user: 'alice_user' },
  { id: 2, type: 'note', message: 'Note updated on Project Alpha', timestamp: '15 min ago', user: 'bob_dev' },
  { id: 3, type: 'review', message: 'Review completed for Task #442', timestamp: '1 hour ago', user: 'carol_pm' },
  { id: 4, type: 'tracking', message: 'Weekly report generated', timestamp: '3 hours ago', user: 'dave_ops' },
];

function StatCard({ title, value, icon, color }) {
  const safeTitle = sanitizeInput(title);
  const safeValue = String(parseInt(value, 10) || 0);

  return (
    React.createElement('div', {
      className: 'stat-card',
      style: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
        flex: '1 1 200px',
        minWidth: '180px',
      }
    },
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
      },
        React.createElement('div', null,
          React.createElement('p', {
            style: { margin: 0, fontSize: '14px', color: '#666', fontWeight: '500' }
          }, safeTitle),
          React.createElement('h2', {
            style: { margin: '4px 0 0', fontSize: '32px', fontWeight: '700', color: '#1a1a2e' }
          }, safeValue)
        ),
        React.createElement('span', {
          style: { fontSize: '36px', opacity: 0.7 },
          role: 'img',
          'aria-label': safeTitle
        }, icon)
      )
    )
  );
}

function ActivityItem({ activity }) {
  const safeMessage = sanitizeInput(activity.message);
  const safeUser = sanitizeUsername(activity.user);
  const safeTimestamp = sanitizeInput(activity.timestamp);

  const typeColors = {
    tracking: '#3b82f6',
    note: '#10b981',
    review: '#f59e0b',
    default: '#6366f1',
  };

  const typeIcons = {
    tracking: '📍',
    note: '📝',
    review: '✅',
    default: '🔔',
  };

  const color = typeColors[activity.type] || typeColors.default;
  const icon = typeIcons[activity.type] || typeIcons.default;

  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
      gap: '12px',
    }
  },
    React.createElement('span', {
      style: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: color + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0,
      },
      role: 'img',
      'aria-label': activity.type
    }, icon),
    React.createElement('div', { style: { flex: 1 } },
      React.createElement('p', {
        style: { margin: 0, fontSize: '14px', color: '#1a1a2e', fontWeight: '500' }
      }, safeMessage),
      React.createElement('p', {
        style: { margin: '2px 0 0', fontSize: '12px', color: '#888' }
      },
        React.createElement('span', null, '@' + safeUser),
        React.createElement('span', { style: { margin: '0 6px' } }, '·'),
        React.createElement('span', null, safeTimestamp)
      )
    )
  );
}

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const raw = e.target.value;

    if (containsXSS(raw)) {
      setError('Invalid characters detected in search query');
      return;
    }

    if (raw.length > 200) {
      setError('Search query is too long (max 200 characters)');
      return;
    }

    setError('');
    setQuery(raw);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const sanitized = sanitizeInput(query, { maxLength: 200 });
    onSearch(sanitized);
  }, [query, onSearch]);

  return React.createElement('form', {
    onSubmit: handleSubmit,
    style: { marginBottom: '24px' },
    noValidate: true,
  },
    React.createElement('div', {
      style: { display: 'flex', gap: '8px' }
    },
      React.createElement('input', {
        type: 'text',
        value: query,
        onChange: handleChange,
        placeholder: 'Search activities...',
        'aria-label': 'Search activities',
        'aria-describedby': error ? 'search-error' : undefined,
        style: {
          flex: 1,
          padding: '10px 16px',
          border: error ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          background: '#fff',
        }
      }),
      React.createElement('button', {
        type: 'submit',
        style: {
          padding: '10px 20px',
          background: '#6366f1',
          color: '#