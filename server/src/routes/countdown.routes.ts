// 倒计时路由：GET/POST/DELETE /api/countdowns
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { getCountdowns, createCountdown, deleteCountdown } from '../services/countdown.service.js';
import { ok, fail } from '../utils/response.js';

const createCountdownSchema = z.object({
  title: z.string().min(1).max(200),
  targetDate: z.string().min(1),
  icon: z.string().max(10).optional(),
});

export async function countdownRoutes(app: FastifyInstance) {
  app.get('/api/countdowns', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const data = await getCountdowns(userId);
    return ok(data);
  });

  app.post('/api/countdowns', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = createCountdownSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail(parsed.error.errors[0].message));
    }
    const userId = (request as any).userId as number;
    const countdown = await createCountdown(userId, parsed.data);
    return reply.status(201).send(ok(countdown));
  });

  app.delete('/api/countdowns/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deleteCountdown(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('Countdown not found'));
    return reply.send(ok(null));
  });
}
