import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // API
  API_BASE_URL: z
    .string()
    .url('Invalid API base URL')
    .default('http://localhost:3000'),
  API_VERSION: z.string().default('v1'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(): Environment {
  const env = process.env;

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      console.error(' Environment validation failed:\n', missingVars);
      process.exit(1);
    }
    throw error;
  }
}

export const config = validateEnv();

// Helper functions
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isStaging = config.NODE_ENV === 'staging';
