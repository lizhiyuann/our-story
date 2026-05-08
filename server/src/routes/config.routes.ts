// 配置路由：向客户端暴露只读的应用配置（不含敏感信息）
import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { ok, fail } from '../utils/response.js';

export async function configRoutes(app: FastifyInstance) {
  app.get('/api/config', async (_request, reply) => {
    try {
      const configPath = path.resolve(process.cwd(), '../config/app.json');
      const raw = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(raw);
      // 只暴露客户端需要的字段，不暴露敏感信息（如端口、密钥等）
      return ok({
        love: config.love,
        moods: config.moods,
        rants: config.rants,
        countdown: config.countdown,
        timeline: config.timeline,
        photos: { maxSizeMB: config.photos.maxSizeMB, allowedTypes: config.photos.allowedTypes },
        chat: config.chat,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send(fail('配置文件加载失败'));
    }
  });
}
