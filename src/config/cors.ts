import type { CorsOptions } from 'cors';
import { env } from './env.js';

export function getCorsOptions(): CorsOptions {
  return {
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  };
}
