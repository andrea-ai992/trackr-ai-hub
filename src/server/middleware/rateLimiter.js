Je vais optimiser le rate-limiting pour l'endpoint `/api/auth` avec une fenêtre de 15 minutes et 5 tentatives max, tout en améliorant la gestion des erreurs et le tracking des tentatives échouées.

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    const window = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5; // 5 requêtes max par fenêtre
    const maxFailedAttempts = 5; // 5 tentatives échouées avant blocage
    const blockDuration = 30 * 60 * 1000; // 30 minutes de blocage

    // Vérifier si l'IP est bloquée
    const { data: blockData, error: blockError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .eq('blocked', true)
      .gte('expires_at', now)
      .single();

    if (blockError && blockError.code !== 'PGRST116') {
      console.error('Erreur Supabase dans vérification blocage:', blockError);
    }

    if (blockData) {
      const remainingTime = Math.max(0, Math.floor((blockData.expires_at - now) / 1000));
      res.set('X-RateLimit-Reset', remainingTime);
      res.set('Retry-After', remainingTime);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `IP temporairement bloquée. Réessayez dans ${Math.ceil(remainingTime / 60)} minutes.`,
        retryAfter: remainingTime
      });
    }

    // Récupérer les données existantes
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .gte('expires_at', now)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur Supabase dans récupération:', error);
    }

    if (data) {
      const requests = data.requests || 0;
      const failedAttempts = data.failed_attempts || 0;
      const lastRequest = data.last_request || now;
      const lastFailedAttempt = data.last_failed_attempt || 0;

      // Vérifier les tentatives échouées
      if (failedAttempts >= maxFailedAttempts && now - lastFailedAttempt < window) {
        const remainingTime = Math.floor((window - (now - lastFailedAttempt)) / 1000);
        res.set('X-RateLimit-Reset', remainingTime);
        res.set('Retry-After', remainingTime);

        await supabase
          .from('rate_limits')
          .upsert({
            ip,
            requests: maxRequests,
            last_request: now,
            failed_attempts: maxFailedAttempts,
            last_failed_attempt: now,
            expires_at: now + blockDuration,
            blocked: true
          });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Trop de tentatives échouées. IP bloquée pour ${Math.ceil(blockDuration / 60 / 60)} heures.`,
          retryAfter: blockDuration
        });
      }

      // Vérifier la limite de requêtes
      if (requests >= maxRequests && now - lastRequest < window) {
        const remainingTime = Math.floor((window - (now - lastRequest)) / 1000);
        res.set('X-RateLimit-Reset', remainingTime);
        res.set('Retry-After', remainingTime);

        await supabase
          .from('rate_limits')
          .upsert({
            ip,
            requests: maxRequests,
            last_request: now,
            failed_attempts: failedAttempts,
            last_failed_attempt: lastFailedAttempt,
            expires_at: now + blockDuration,
            blocked: true
          });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Limite de ${maxRequests} requêtes atteinte. Réessayez dans ${Math.ceil(remainingTime / 60)} minutes.`,
          retryAfter: remainingTime
        });
      }

      // Mettre à jour le compteur de requêtes
      await supabase
        .from('rate_limits')
        .upsert({
          ip,
          requests: Math.min(requests + 1, maxRequests),
          last_request: now,
          failed_attempts: failedAttempts,
          last_failed_attempt: lastFailedAttempt,
          expires_at: now + window
        });
    } else {
      // Créer un nouvel enregistrement
      await supabase
        .from('rate_limits')
        .insert({
          ip,
          requests: 1,
          last_request: now,
          failed_attempts: 0,
          last_failed_attempt: 0,
          expires_at: now + window
        });
    }

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - (data?.requests || 0));
    res.set('X-RateLimit-Reset', Math.floor((now + window) / 1000));

    next();
  } catch (err) {
    console.error('Erreur critique dans rateLimiter:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export default rateLimiter;