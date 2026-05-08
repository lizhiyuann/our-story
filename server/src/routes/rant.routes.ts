// 吐槽路由：GET/POST/DELETE /api/rants
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { getRants, createRant, deleteRant } from '../services/rant.service.js';
import { ok, paginated, fail } from '../utils/response.js';

const createRantSchema = z.object({
  rantType: z.enum(['rant', 'scold', 'complain']),
  content: z.string().min(1).max(2000),
  intensity: z.number().int().min(1).max(10),
});

export async function rantRoutes(app: FastifyInstance) {
  app.get('/api/rants', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const { page = 1, limit = 20 } = request.query as any;
    const result = await getRants(userId, Number(page), Number(limit));
    return paginated(result.data, result.total, Number(page), Number(limit));
  });

  app.post('/api/rants', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = createRantSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail(parsed.error.errors[0].message));
    }
    const userId = (request as any).userId as number;
    const rant = await createRant(userId, parsed.data);
    return reply.status(201).send(ok(rant));
  });

  app.delete('/api/rants/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deleteRant(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('Rant not found'));
    return reply.send(ok(null));
  });
}
