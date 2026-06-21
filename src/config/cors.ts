import type { CorsOptions } from 'cors';
import { env } from './env.js';

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

export function getCorsOptions(): CorsOptions {
  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      if (env.CORS_ORIGINS.includes(normalized)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  };
}
