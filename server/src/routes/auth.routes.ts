import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticateUser, getUserById } from '../services/auth.service.js';
import { authGuard } from '../middleware/auth.js';
import { ok, fail } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Invalid input'));
    }

    try {
      const user = await authenticateUser(parsed.data.username, parsed.data.password);
      const token = app.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '7d' });

      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.send(ok(user));
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send(fail(error.message));
      }
      return reply.status(500).send(fail('Internal server error'));
    }
  });

  app.get('/api/auth/me', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const user = await getUserById(userId);
    if (!user) {
      return ok(null);
    }
    return ok({ id: user.id, username: user.username, displayName: user.displayName });
  });

  app.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.send(ok(null));
  });
}
