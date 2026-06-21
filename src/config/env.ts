import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.parse(process.env);

/** Browsers send Origin without a trailing slash; normalize env values to match. */
function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

export const env = {
  ...parsed,
  CORS_ORIGINS: parsed.CORS_ORIGIN.split(',')
    .map(normalizeOrigin)
    .filter(Boolean),
};
