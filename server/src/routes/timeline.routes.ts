// 时间轴路由：GET/POST/DELETE /api/timeline
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { getTimeline, createTimelineEvent, deleteTimelineEvent } from '../services/timeline.service.js';
import { ok, fail } from '../utils/response.js';

const createEventSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  icon: z.string().max(10).optional(),
});

export async function timelineRoutes(app: FastifyInstance) {
  app.get('/api/timeline', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const data = await getTimeline(userId);
    return ok(data);
  });

  app.post('/api/timeline', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = createEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail(parsed.error.errors[0].message));
    }
    const userId = (request as any).userId as number;
    const event = await createTimelineEvent(userId, parsed.data);
    return reply.status(201).send(ok(event));
  });

  app.delete('/api/timeline/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deleteTimelineEvent(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('Event not found'));
    return reply.send(ok(null));
  });
}
