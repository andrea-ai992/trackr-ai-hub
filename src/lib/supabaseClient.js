src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Trackr] Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined.'
  );
}

const SESSION_STORAGE_KEY = 'trackr_session';

const sessionStorageAdapter = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      console.warn('[Trackr] sessionStorage.setItem failed for key:', key);
    }
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      console.warn('[Trackr] sessionStorage.removeItem failed for key:', key);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: SESSION_STORAGE_KEY,
    storage: sessionStorageAdapter,
    flowType: 'pkce',
  },
});

const forceLogoutAndRedirect = async (reason) => {
  console.warn('[Trackr] Session invalidated — reason:', reason);

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.error('[Trackr] Error during forced sign out:', err);
  }

  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }

  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    window.location.replace('/login');
  }
};

let authListenerInitialized = false;

export const initAuthListener = () => {
  if (authListenerInitialized) return;
  authListenerInitialized = true;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.info('[Trackr] Auth event:', event, '| session:', session ? 'present' : 'null');

      switch (event) {
        case 'TOKEN_REFRESHED': {
          if (!session) {
            await forceLogoutAndRedirect('TOKEN_REFRESHED with null session');
          } else {
            console.info('[Trackr] Token refreshed successfully.');
          }
          break;
        }

        case 'SIGNED_OUT': {
          try {
            sessionStorage.clear();
          } catch {
            // ignore
          }
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            window.location.replace('/login');
          }
          break;
        }

        case 'SIGNED_IN': {
          if (!session) {
            await forceLogoutAndRedirect('SIGNED_IN with null session');
          }
          break;
        }

        case 'USER_UPDATED': {
          if (!session) {
            await forceLogoutAndRedirect('USER_UPDATED with null session');
          }
          break;
        }

        default:
          break;
      }
    }
  );

  if (typeof window !== 'undefined') {
    window.__trackrAuthSubscription = subscription;
  }

  return subscription;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Trackr] getSession error:', error);
    await forceLogoutAndRedirect('getSession error: ' + error.message);
    return null;
  }

  if (!data?.session) {
    return null;
  }

  const { expires_at } = data.session;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (expires_at && expires_at < nowInSeconds) {
    await forceLogoutAndRedirect('Session expired (expires_at in the past)');
    return null;
  }

  return data.session;
};

export const getUser = async () => {
  const session = await getSession();
  return session?.user ?? null;
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } finally {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.replace('/login');
  }
};

export default supabase;