// Fastify 服务入口：注册插件、路由、启动服务
import 'dotenv/config';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import { loadEnv } from './config/env.js';
import { seedUsers } from './services/auth.service.js';
import { authRoutes } from './routes/auth.routes.js';
import { moodRoutes } from './routes/mood.routes.js';
import { rantRoutes } from './routes/rant.routes.js';
import { countdownRoutes } from './routes/countdown.routes.js';
import { timelineRoutes } from './routes/timeline.routes.js';
import { photoRoutes } from './routes/photo.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { configRoutes } from './routes/config.routes.js';
import { replyRoutes } from './routes/reply.routes.js';
import { AppError } from './utils/errors.js';
import { fail } from './utils/response.js';

const env = loadEnv();

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: env.NODE_ENV === 'production' ? false : true,
  credentials: true,
});
await app.register(cookie);
await app.register(jwt, { secret: env.JWT_SECRET });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
await app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
});

// Error handler
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(fail(error.message));
  }
  app.log.error(error);
  return reply.status(500).send(fail('Internal server error'));
});

// Routes
await app.register(authRoutes);
await app.register(moodRoutes);
await app.register(rantRoutes);
await app.register(countdownRoutes);
await app.register(timelineRoutes);
await app.register(photoRoutes);
await app.register(chatRoutes);
await app.register(configRoutes);
await app.register(replyRoutes);

// Health check
app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Seed users and start
try {
  await seedUsers(env);
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`Server running on port ${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
