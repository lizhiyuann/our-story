// JWT 认证中间件，支持 Agent 内部调用
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Support internal agent calls via X-Agent-User-Id header
    const agentUserId = request.headers['x-agent-user-id'];
    if (agentUserId) {
      (request as any).userId = Number(agentUserId);
      (request as any).username = 'agent';
      return;
    }

    const token = request.cookies.token;
    if (!token) {
      throw new UnauthorizedError();
    }
    const decoded = request.server.jwt.verify<{ id: number; username: string }>(token);
    (request as any).userId = decoded.id;
    (request as any).username = decoded.username;
  } catch {
    throw new UnauthorizedError();
  }
}
