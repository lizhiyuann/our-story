// 回复路由：GET/POST/DELETE /api/replies
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { getReplies, createReply, deleteReply } from '../services/reply.service.js';
import { ok, fail } from '../utils/response.js';

const createReplySchema = z.object({
  targetType: z.enum(['mood', 'rant', 'countdown', 'timeline', 'photo']),
  targetId: z.number().int().positive(),
  content: z.string().min(1).max(2000),
});

export async function replyRoutes(app: FastifyInstance) {
  // 获取某条目的所有回复
  app.get('/api/replies/:targetType/:targetId', { preHandler: [authGuard] }, async (request) => {
    const { targetType, targetId } = request.params as { targetType: string; targetId: string };
    const data = await getReplies(targetType, Number(targetId));
    return ok(data);
  });

  // 添加回复
  app.post('/api/replies', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = createReplySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail(parsed.error.errors[0].message));
    }
    const userId = (request as any).userId as number;
    const result = await createReply(userId, parsed.data);
    return reply.status(201).send(ok(result));
  });

  // 删除回复
  app.delete('/api/replies/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deleteReply(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('回复不存在'));
    return reply.send(ok(null));
  });
}
