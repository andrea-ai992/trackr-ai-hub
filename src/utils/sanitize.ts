Je vais créer tous les fichiers nécessaires pour renforcer la sécurité XSS.

**Fichier 1: src/utils/sanitize.ts**

import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  stripAll?: boolean;
}

const DEFAULT_MAX_LENGTH = 10000;
const USERNAME_MAX_LENGTH = 50;
const NOTE_MAX_LENGTH = 5000;
const TRACKING_MAX_LENGTH = 500;

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
  /-moz-binding/gi,
  /<img[^>]+src[^>]*>/gi,
  /url\s*\(\s*['"]?\s*javascript/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|CAST|CONVERT)\b)/gi,
  /(--|\/\*|\*\/|;)/g,
  /(\bOR\b|\bAND\b)\s+[\w\s]*=[\w\s]*/gi,
];

export const sanitizeInput = (
  input: string,
  options: SanitizeOptions = {}
): string => {
  if (typeof input !== 'string') {
    return '';
  }

  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
  let sanitized = input.trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  sanitized = sanitized.replace(/\0/g, '');

  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  sanitized = sanitized
    .replace(/&(?!(amp|lt|gt|quot|#39|apos);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return sanitized;
};

export const sanitizeHTML = (
  html: string,
  options: SanitizeOptions = {}
): string => {
  if (typeof html !== 'string') {
    return '';
  }

  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  if (html.length > maxLength) {
    html = html.substring(0, maxLength);
  }

  if (typeof window === 'undefined') {
    let sanitized = html;
    for (const pattern of XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
    return sanitized;
  }

  const allowedTags = options.allowedTags ?? [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'a', 'span', 'div',
  ];

  const allowedAttributes = options.allowedAttributes ?? ['href', 'title', 'class'];

  if (options.stripAll) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  const purifyConfig: DOMPurify.Config = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
    FORCE_BODY: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  const sanitized = DOMPurify.sanitize(html, purifyConfig);

  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();

  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return false;
  }

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(trimmed)) {
      pattern.lastIndex = 0;
      return false;
    }
    pattern.lastIndex = 0;
  }

  const [localPart, domain] = trimmed.split('@');
  if (!localPart || !domain) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return false;
  }

  if (!domain.includes('.')) {
    return false;
  }

  return true;
};

export const sanitizeUsername = (username: string): string => {
  if (typeof username !== 'string') {
    return '';
  }

  let sanitized = username.trim();
  sanitized = sanitized.substring(0, USERNAME_MAX_LENGTH);
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.@\s]/g, '');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  for (const pattern of XSS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '');
    }
    pattern.lastIndex = 0;
  }

  return sanitized;
};

export const sanitizeNote = (note: string): string => {
  if (typeof note !== 'string') {
    return '';
  }

  return sanitizeInput(note, { maxLength: NOTE_MAX_LENGTH });
};

export const sanitizeTrackingInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return sanitizeInput(input, { maxLength: TRACKING_MAX_LENGTH });
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Invalid password type'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const containsSQLInjection = (input: string): boolean => {
  if (typeof input !== 'string') {
    return false;
  }

  for (const pattern of SQL_INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      pattern.lastIndex = 0;
      return true;
    }
    pattern.lastIndex = 0;
  }

  return false;
};

export const sanitizeFormData = (
  formData: Record<string, string>
): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(formData)) {
    const sanitizedKey = sanitizeInput(key, { maxLength: 100 });
    const sanitizedValue = sanitizeInput(value);
    sanitized[sanitizedKey] = sanitizedValue;
  }

  return sanitized;
};

export const createSafeTextNode = (text: string): string => {
  return sanitizeInput(text, { stripAll: true, maxLength: DEFAULT_MAX_LENGTH });
};

export default {
  sanitizeInput,
  sanitizeHTML,
  validateEmail,
  sanitizeUsername,
  sanitizeNote,
  sanitizeTrackingInput,
  validatePassword,
  containsSQLInjection,
  sanitizeFormData,
  createSafeTextNode,
};


**Fichier 2: src/__tests__/sanitize.test.js**

import { sanitizeInput, sanitizeHTML, validateEmail, sanitizeUsername, sanitizeNote, sanitizeTrackingInput, containsSQLInjection, sanitizeFormData } from '../utils/sanitize';

describe('sanitizeInput - XSS Protection Tests', () => {
  test('Case 1: Basic script tag injection should be removed', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert("XSS")');
    expect(result).not.toContain('</script>');
  });

  test('Case 2: JavaScript protocol injection should be neutralized', () => {
    const maliciousInput = 'javascript:alert(document.cookie)';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toMatch(/javascript\s*:/i);
  });

  test('Case 3: Event handler injection (onerror) should be removed', () => {
    const maliciousInput = '<img src=x onerror=alert(1)>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<img');
  });

  test('Case 4: Event handler injection (onclick) should be removed', () => {
    const maliciousInput = '<div onclick="alert(document.cookie)">Click me</div>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  test('Case 5: iframe injection should be blocked', () => {
    const maliciousInput = '<iframe src="javascript:alert(1)"></iframe>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('javascript:');
  });

  test('Case 6: HTML entities encoding - angle brackets should be escaped', () => {
    const input = '<b>Bold text</b>';
    const result = sanitizeInput(input);
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).not.toContain('<b>');
  });

  test('Case 7: Null byte injection should be removed', () => {
    const maliciousInput = 'normal\0text<script>alert(1)</script>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('\0');
    expect(result).not.toContain('<script>');
  });

  test('Case 8: Data URI injection should be blocked', () => {
    const maliciousInput = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toMatch(/data\s*:/i);
  });

  test('Case 9: VBScript injection should be blocked', () => {
    const maliciousInput = 'vbscript:MsgBox("XSS")';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toMatch(/vbscript\s*:/i);
  });

  test('Case 10: CSS expression injection should be blocked', () => {
    const maliciousInput = '<div style="width:expression(alert(1))">test</div>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('expression(');
  });

  test('Case 11: Input exceeding maxLength should be truncated', () => {
    const longInput = 'a'.repeat(20000);
    const result = sanitizeInput(longInput, { maxLength: 100 });
    expect(result.length).toBeLessThanOrEqual(100);
  });

  test('Case 12: Non-string input should return empty string', () => {
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
    expect(sanitizeInput(123 as any)).toBe('');
    expect(sanitizeInput({} as any)).toBe('');
  });

  test('Case 13: Valid plain text should pass through sanitized', () => {
    const validInput = 'Hello, this is a normal text with numbers 123 and symbols!';
    const result = sanitizeInput(validInput);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  test('Case 14: Double encoding attack should be handled', () => {
    const maliciousInput = '%3Cscript%3Ealert(1)%3C%2Fscript%3E';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('<script>');
  });

  test('Case 15: SVG-based XSS should be blocked', () => {
    const maliciousInput = '<svg onload=alert(1)>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('onload');
  });

  test('Case 16: Object tag injection should be blocked', () => {
    const maliciousInput = '<object data="javascript:alert(1)"></object>';
    const result = sanitizeInput(maliciousInput);
    expect(result).not.toContain('<object');
    expect(result).not.toContain('javascript:');
  });
});

describe('sanitizeHTML - HTML Sanitization Tests', () => {
  test('Case 1: Script tags should be completely removed from HTML', () => {
    const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
    const result = sanitizeHTML(maliciousHTML);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>');
  });

  test('Case 2: Allowed HTML tags should be preserved', () => {
    const safeHTML = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHTML(safeHTML);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  test('Case 3: Event attributes should be removed from HTML elements', () => {
    const maliciousHTML = '<p onclick="alert(1)" onmouseover="steal()">Click me</p>';
    const result = sanitizeHTML(maliciousHTML);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('<p>');
  });

  test('Case 4: Malicious href attributes should be sanitized', () => {
    const maliciousHTML = '<a href="javascript:alert(1)">Click here</a>';
    const result = sanitizeHTML(maliciousHTML);
    expect(result).not.toContain('javascript:');
  });

  test('Case 5: Style injection in HTML should be blocked', () => {
    const maliciousHTML = '<div style="background:url(javascript:alert(1))">Test</div>';
    const result = sanitizeHTML(maliciousHTML);
    expect(result).not.toContain('javascript:');
  });

  test('Case 6: stripAll option should remove all HTML tags', () => {
    const html = '<p>Hello <strong>World</strong></p><script>alert(1)</script>';
    const result = sanitizeHTML(html, { stripAll: true });
    expect(result).toBe('');
  });

  test('Case 7: Non-string input to sanitizeHTML should return empty string', () => {
    expect(sanitizeHTML(null as any)).toBe('');
    expect(sanitizeHTML(undefined as any)).toBe('');
  });

  test('Case 8: Form tags should be forbidden in HTML', () => {
    const maliciousHTML = '<form action="http://evil.com"><input type="text" name="user"/></form>';
    const result = sanitizeHTML(maliciousHTML);
    expect(result).not.toContain('<form');
    expect(result).not.toContain('<input');
  });
});

describe('validateEmail - Email Validation Tests', () => {
  test('Case 1: Valid email should return true', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    expect(validateEmail('user123@subdomain.domain.org')).toBe(true);
  });

  test('Case 2: Invalid email formats should return false', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@domain')).