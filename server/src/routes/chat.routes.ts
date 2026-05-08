// 聊天路由：发送消息、流式输出、清空历史
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../middleware/auth.js';
import { chat, chatStream, clearChatHistory, getChatHistory } from '../services/ai.service.js';
import { ok, fail } from '../utils/response.js';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function chatRoutes(app: FastifyInstance) {
  // 非流式聊天
  app.post('/api/chat', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = chatSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Message is required'));
    }
    const userId = (request as any).userId as number;
    const reply_text = await chat(userId, parsed.data.message);
    return reply.send(ok({ reply: reply_text }));
  });

  // 流式聊天（SSE）
  app.post('/api/chat/stream', { preHandler: [authGuard] }, async (request, reply) => {
    const parsed = chatSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Message is required'));
    }
    const userId = (request as any).userId as number;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    try {
      for await (const chunk of chatStream(userId, parsed.data.message)) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ text: '', done: true, error: 'stream error' })}\n\n`);
    }
    reply.raw.end();
  });

  // 清空聊天历史
  app.delete('/api/chat/history', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    await clearChatHistory(userId);
    return reply.send(ok(null));
  });

  // 获取聊天历史
  app.get('/api/chat/history', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const { limit = 50 } = request.query as any;
    const history = await getChatHistory(userId, Number(limit));
    return ok(history);
  });
}
