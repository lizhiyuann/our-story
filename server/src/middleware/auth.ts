// JWT 认证中间件，支持 Agent 内部调用（需携带密钥）
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

// Agent 内部调用密钥，必须与 AI_SERVICE_AGENT_SECRET 环境变量一致
const AGENT_SECRET = process.env.AGENT_SECRET ?? '';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    // 内部 Agent 调用：必须同时携带 User-Id 和 Secret
    const agentUserId = request.headers['x-agent-user-id'];
    const agentSecret = request.headers['x-agent-secret'];
    if (agentUserId && agentSecret) {
      if (!AGENT_SECRET || agentSecret !== AGENT_SECRET) {
        throw new UnauthorizedError('Invalid agent secret');
      }
      (request as any).userId = Number(agentUserId);
      (request as any).username = 'agent';
      return;
    }

    // 普通用户：JWT Cookie 认证
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
