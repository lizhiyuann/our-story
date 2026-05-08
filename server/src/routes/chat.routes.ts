import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { chat, getChatHistory } from '../services/ai.service.js';
import { ok, fail } from '../utils/response.js';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function chatRoutes(app: FastifyInstance) {
  app.post('/api/chat', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = chatSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Message is required'));
    }
    const userId = (request as any).userId as number;
    const reply_text = await chat(userId, parsed.data.message);
    return reply.send(ok({ reply: reply_text }));
  });

  app.get('/api/chat/history', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const { limit = 50 } = request.query as any;
    const history = await getChatHistory(userId, Number(limit));
    return ok(history);
  });
}
