```javascript
/**
 * @module apiConfig
 * @description Centralized secure secrets management for Trackr AI Hub.
 * All sensitive environment variable access is gated through typed getter
 * functions. Raw values are never exported. A startup validation routine
 * throws immediately when a required variable is absent so that bad builds
 * are caught before any runtime damage occurs.
 *
 * ⚠️  SECURITY NOTE: All VITE_* variables are inlined into the client bundle
 *     by Vite at build time. Never add truly server-only secrets (e.g. service
 *     role keys) with the VITE_ prefix in a pure SPA. For SSR / Edge Functions
 *     use un-prefixed env vars accessed via process.env or context.env.
 *
 * Usage:
 *   import { getOpenAIKey, getSupabaseUrl } from '@/config/apiConfig';
 *   const key = getOpenAIKey();
 */

// ---------------------------------------------------------------------------
// Internal registry
// ---------------------------------------------------------------------------

/**
 * Each entry describes one environment variable the application depends on.
 *
 * @typedef {Object} EnvEntry
 * @property {string}  key        - The import.meta.env key (VITE_* prefix).
 * @property {boolean} required   - Whether the app cannot start without it.
 * @property {string}  service    - Human-readable service name for error msgs.
 * @property {'secret'|'url'|'id'|'flag'} kind - Semantic type for validation.
 * @property {boolean} [serverOnly] - Emit a warning if accessed in a browser context.
 */

/** @type {EnvEntry[]} */
const ENV_REGISTRY = [
  // ── AI / LLM ─────────────────────────────────────────────────────────────
  {
    key: 'VITE_OPENAI_API_KEY',
    required: true,
    service: 'OpenAI',
    kind: 'secret',
  },
  {
    key: 'VITE_OPENAI_ORG_ID',
    required: false,
    service: 'OpenAI Organization',
    kind: 'id',
  },
  {
    key: 'VITE_OPENAI_MODEL',
    required: false,
    service: 'OpenAI Model Override',
    kind: 'id',
  },

  // ── Supabase ──────────────────────────────────────────────────────────────
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    service: 'Supabase',
    kind: 'url',
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    service: 'Supabase Anon',
    kind: 'secret',
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  {
    key: 'VITE_POSTHOG_API_KEY',
    required: false,
    service: 'PostHog',
    kind: 'secret',
  },
  {
    key: 'VITE_POSTHOG_HOST',
    required: false,
    service: 'PostHog Host',
    kind: 'url',
  },
  {
    key: 'VITE_SENTRY_DSN',
    required: false,
    service: 'Sentry',
    kind: 'url',
  },

  // ── App meta ──────────────────────────────────────────────────────────────
  {
    key: 'VITE_APP_ENV',
    required: false,
    service: 'App Environment',
    kind: 'flag',
  },
  {
    key: 'VITE_APP_VERSION',
    required: false,
    service: 'App Version',
    kind: 'id',
  },
  {
    key: 'VITE_PUBLIC_BASE_URL',
    required: false,
    service: 'Public Base URL',
    kind: 'url',
  },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Safe accessor for import.meta.env — works in Vite (browser + SSR) and
 * gracefully degrades in plain Node test runners where import.meta.env may
 * be undefined.
 *
 * @returns {Record<string, string>}
 */
function _env() {
  // import.meta.env is injected by Vite; fall back to empty object so that
  // test environments that don't polyfill it don't throw a ReferenceError.
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env;
  }
  return {};
}

/**
 * Reads a single variable from the environment.
 * Returns undefined when the variable is absent or empty-string.
 *
 * @param {string} key
 * @returns {string|undefined}
 */
function _read(key) {
  const raw = _env()[key];
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return undefined;
  }
  return String(raw).trim();
}

/**
 * Validates the format of a value depending on its semantic kind.
 *
 * @param {string} value
 * @param {EnvEntry['kind']} kind
 * @param {string} key
 * @returns {{ valid: boolean; reason?: string }}
 */
function _validateFormat(value, kind, key) {
  switch (kind) {
    case 'url': {
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return {
          valid: false,
          reason: `${key} must be a valid URL, got: "${_redact(value)}"`,
        };
      }
    }
    case 'secret': {
      if (value.length < 8) {
        return {
          valid: false,
          reason: `${key} appears too short to be a valid secret (< 8 chars).`,
        };
      }
      return { valid: true };
    }
    case 'id':
    case 'flag':
    default:
      return { valid: true };
  }
}

/**
 * Redacts a string for safe display in error messages.
 * Shows only the first 4 characters followed by asterisks.
 *
 * @param {string} value
 * @returns {string}
 */
function _redact(value) {
  if (!value || value.length <= 4) return '****';
  return value.slice(0, 4) + '*'.repeat(Math.min(value.length - 4, 8));
}

/**
 * Formats a single error/warning line so it fits inside the 60-char box.
 * Long messages are word-wrapped across multiple box lines.
 *
 * @param {string} message
 * @param {number} [innerWidth=56]
 * @returns {string}
 */
function _boxLines(message, innerWidth = 56) {
  // Strip the "[apiConfig] " prefix that is already implied inside the box.
  const text = message.replace(/^\[apiConfig\]\s*/i, '');
  const lines = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= innerWidth) {
      lines.push(`║  ${remaining.padEnd(innerWidth)}║`);
      break;
    }
    // Find last space within innerWidth
    const cut = remaining.lastIndexOf(' ', innerWidth);
    const breakAt = cut > 0 ? cut : innerWidth;
    lines.push(`║  ${remaining.slice(0, breakAt).padEnd(innerWidth)}║`);
    remaining = remaining.slice(breakAt).trimStart();
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Startup validation
// ---------------------------------------------------------------------------

/**
 * Validates all entries in ENV_REGISTRY.
 * - Required entries with a missing or empty value cause an immediate throw.
 * - Present values are additionally validated for format correctness.
 * - Runs once at module-load time so failures surface during build / SSR init.
 *
 * @throws {Error} when any required variable is missing or any value is malformed.
 */
function _runStartupValidation() {
  const errors = [];
  const warnings = [];

  for (const entry of ENV_REGISTRY) {
    const value = _read(entry.key);

    if (value === undefined) {
      if (entry.required) {
        errors.push(
          `MISSING required env var: ${entry.key} (${entry.service})`
        );
      } else {
        warnings.push(
          `Optional env var not set: ${entry.key} (${entry.service})`
        );
      }
      continue;
    }

    // Format check for present values
    const { valid, reason } = _validateFormat(value, entry.kind, entry.key);
    if (!valid) {
      if (entry.required) {
        errors.push(`INVALID format — ${reason}`);
      } else {
        warnings.push(`Suspicious format — ${reason}`);
      }
    }
  }

  // Emit warnings non-fatally in non-production environments only
  const isProd = _read('VITE_APP_ENV') === 'production';
  if (warnings.length > 0 && !isProd) {
    warnings.forEach((w) => console.warn(`[apiConfig] ${w}`));
  }

  // Fatal: block startup when required vars are broken
  if (errors.length > 0) {
    const border = '╠' + '═'.repeat(60) + '╣';
    const top    = '╔' + '═'.repeat(60) + '╗';
    const bottom = '╚' + '═'.repeat(60) + '╝';
    const title  = '║' + '  Trackr — Environment Configuration Error  '.padStart(52).padEnd(60) + '║';
    const hint   = '║  Check .env.example for the full list of required vars. ║';

    const errorLines = errors.map((e) => _boxLines(e)).join('\n');

    const message =
      '\n\n' +
      top    + '\n' +
      title  + '\n' +
      border + '\n' +
      errorLines + '\n' +
      border + '\n' +
      hint   + '\n' +
      bottom + '\n';

    throw new Error(message);
  }
}

// Run immediately on module load — intentionally synchronous so any bundler /
// runtime will surface the failure before other modules that depend on this
// config are evaluated.
_runStartupValidation();

// ---------------------------------------------------------------------------
// Public getter API
// ---------------------------------------------------------------------------
// Each getter is a zero-argument function that reads from import.meta.env on
// every call (supports hot-reload in dev). Callers receive the value or
// undefined — they never get a reference to the raw env object.

// ── OpenAI ──────────────────────────────────────────────────────────────────

/**
 * Returns the OpenAI API key.
 * Guaranteed non-undefined after startup validation passes.
 *
 * @returns {string}
 */
export function getOpenAIKey() {
  // Non-null assertion: startup validation ensures this is present.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return /** @type {string} */ (_read('VITE_OPENAI_API_KEY'));
}

/**
 * Returns the OpenAI Organization ID (optional).
 *
 * @returns {string|undefined}
 */
export function getOpenAIOrgId() {
  return _read('VITE_OPENAI_ORG_ID');
}

/**
 * Returns the OpenAI model override.
 * Defaults to 'gpt-4o' when not set.
 *
 * @returns {string}
 */
export function getOpenAIModel() {
  return _read('VITE_OPENAI_MODEL') ?? 'gpt-4o';
}

// ── Supabase ─────────────────────────────────────────────────────────────────

/**
 * Returns the Supabase project URL.
 * Guaranteed non-undefined after startup validation passes.
 *
 * @returns {string}
 */
export function getSupabaseUrl() {
  return /** @type {string} */ (_read('VITE_SUPABASE_URL'));
}

/**
 * Returns the Supabase anon (public) key.
 * Guaranteed non-undefined after startup validation passes.
 *
 * @returns {string}
 */
export function getSupabaseAnonKey() {
  return /** @type {string} */ (_read('VITE_SUPABASE_ANON_KEY'));
}

// ── Analytics ────────────────────────────────────────────────────────────────

/**
 * Returns the PostHog API key (optional).
 *
 * @returns {string|undefined}
 */
export function getPostHogApiKey() {
  return _read('VITE_POSTHOG_API_KEY');
}

/**
 * Returns the PostHog host URL.
 * Defaults to the PostHog cloud endpoint.
 *
 * @returns {string}
 */
export function getPostHogHost() {
  return _read('VITE_POSTHOG_HOST') ?? 'https://app.posthog.com';
}

/**
 * Returns the Sentry DSN (optional).
 *
 * @returns {string|undefined}
 */
export function getSentryDsn() {
  return _read('VITE_SENTRY_DSN');
}

// ── App meta ─────────────────────────────────────────────────────────────────

/**
 * Returns the current application environment string.
 * Defaults to 'development'.
 *
 * @returns {'development'|'staging'|'production'|string}
 */
export function getAppEnv() {
  return _read('VITE_APP_ENV') ?? 'development';
}

/**
 * Returns true when the app is running in production.
 *
 * @returns {boolean}
 */
export function isProduction() {
  return getAppEnv() === 'production';
}

/**
 * Returns true when the app is running in development.
 *
 * @returns {boolean}
 */
export function isDevelopment() {
  return getAppEnv() === 'development';
}

/**
 * Returns the application version string (optional).
 *
 * @returns {string|undefined}
 */
export function getAppVersion() {
  return _read('VITE_APP_VERSION');
}

/**
 * Returns the public base URL for the deployed application (optional).
 * Useful for constructing absolute links in emails, OG tags, etc.
 *
 * @returns {string|undefined}
 */
export function getPublicBaseUrl() {
  return _read('VITE_PUBLIC_BASE_URL');
}