// 环境变量加载与验证
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USER1_USERNAME: z.string().default('boy'),
  USER1_PASSWORD: z.string().min(6),
  USER1_DISPLAY_NAME: z.string().default('宝贝'),
  USER2_USERNAME: z.string().default('girl'),
  USER2_PASSWORD: z.string().min(6),
  USER2_DISPLAY_NAME: z.string().default('亲爱的'),
  AI_SERVICE_URL: z.string().url().default('http://ai-service:8000'),
  ANTHROPIC_API_KEY: z.string().optional(),
  AGENT_SECRET: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
