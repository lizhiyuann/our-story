// 心情路由：GET/POST/DELETE /api/moods
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { getMoods, createMood, deleteMood } from '../services/mood.service.js';
import { ok, paginated, fail } from '../utils/response.js';

const createMoodSchema = z.object({
  moodType: z.enum(['happy', 'love', 'sad', 'angry', 'thinking', 'sleepy']),
  emoji: z.string().min(1).max(10),
  content: z.string().min(1).max(1000),
});

export async function moodRoutes(app: FastifyInstance) {
  app.get('/api/moods', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const { page = 1, limit = 20 } = request.query as any;
    const result = await getMoods(userId, Number(page), Number(limit));
    return paginated(result.data, result.total, Number(page), Number(limit));
  });

  app.post('/api/moods', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = createMoodSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail(parsed.error.errors[0].message));
    }
    const userId = (request as any).userId as number;
    const mood = await createMood(userId, parsed.data);
    return reply.status(201).send(ok(mood));
  });

  app.delete('/api/moods/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deleteMood(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('Mood not found'));
    return reply.send(ok(null));
  });
}
