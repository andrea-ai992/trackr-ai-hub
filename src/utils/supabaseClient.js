Je vais créer les deux fichiers nécessaires pour sécuriser les sessions Supabase avec vérification d'expiration et refresh automatique.

---

src/utils/supabaseClient.js

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabaseClient;
```

---

src/server/middleware/auth.js

```javascript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'sb-access-token';
const REFRESH_THRESHOLD = 300; // 5 minutes avant expiration

export async function withAuth(handler) {
  return async (req, res) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Vérification d'expiration du token
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = (expiresAt - now) / 1000;

    if (timeUntilExpiry < REFRESH_THRESHOLD) {
      try {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          return NextResponse.redirect(new URL('/login', req.url));
        }

        // Mise à jour du cookie avec le nouveau token
        res.setHeader('Set-Cookie', [
          `sb-access-token=${refreshedSession.access_token}; Path=/; Max-Age=${refreshedSession.expires_in}; SameSite=Lax; Secure; HttpOnly`,
          `sb-refresh-token=${refreshedSession.refresh_token}; Path=/; Max-Age=${refreshedSession.expires_in}; SameSite=Lax; Secure; HttpOnly`
        ]);
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return handler(req, res);
  };
}

export async function requireAuth(req, res) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return session;
}