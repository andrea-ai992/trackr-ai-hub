import { NextResponse } from 'next/server';

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://*.supabase.co https://*.supabase.com https://*.cloudfront.net; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.supabase.com https://*.supabase.co wss://*.supabase.co https://api.coingecko.com https://api.stockdata.org https://api.nasa.gov https://api.openweathermap.org https://api.aviationstack.com https://api-football-beta.p.rapidapi.com https://data.mongodb-api.com; " +
    "frame-src 'self' https://www.google.com https://www.youtube.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "block-all-mixed-content; " +
    "upgrade-insecure-requests; " +
    "require-sri-for script style; " +
    "worker-src 'self' blob:; " +
    "manifest-src 'self'; " +
    "prefetch-src 'self'; " +
    "media-src 'self' blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "script-src-attr 'none'; " +
    "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net; ",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload;',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), vr=(), ' +
    'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), ' +
    'gyroscope=(), magnetometer=(), screen-wake-lock=(), sync-xhr=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Expect-CT': 'max-age=86400, enforce',
  'Feature-Policy': "geolocation 'none'; microphone 'none'; camera 'none'; payment 'none'; usb 'none'",
  'NEL': '{"report_to":"default","max_age":86400,"include_subdomains":true}',
  'Report-To': '{"group":"default","max_age":86400,"endpoints":[{"url":"https://trackr-app-nu.report-uri.com/a/d/g"}]}',
  'Reporting-Endpoints': 'default="https://trackr-app-nu.report-uri.com/a/d/g"'
};

export function withSecurityHeaders(request) {
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-.*.js|worker-.*.js).*)',
  ],
};