import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32).optional(),
  AUTH_BOOTSTRAP_SECRET: z.string().min(12).optional(),
  LEASE_JOB_SECRET: z.string().min(12).optional(),
  JWT_TTL_SECONDS: z.coerce.number().int().positive().max(604800).default(28800),
});

export type AppConfig = z.infer<typeof schema>;
let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  cached ??= schema.parse(process.env);
  return cached;
}

export function requireSecret(name: 'JWT_SECRET' | 'AUTH_BOOTSTRAP_SECRET' | 'LEASE_JOB_SECRET'): string {
  const value = getConfig()[name];
  if (!value) throw new Error(`${name} is required for this operation`);
  return value;
}
