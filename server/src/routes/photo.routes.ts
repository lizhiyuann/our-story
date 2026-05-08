// 相册路由：上传、列表、删除照片
import type { FastifyInstance } from 'fastify';
import { authGuard } from '../middleware/auth.js';
import { uploadPhoto, getPhotos, deletePhoto } from '../services/photo.service.js';
import { ok, paginated, fail } from '../utils/response.js';

export async function photoRoutes(app: FastifyInstance) {
  app.get('/api/photos', { preHandler: [authGuard] }, async (request) => {
    const userId = (request as any).userId as number;
    const { page = 1, limit = 20 } = request.query as any;
    const result = await getPhotos(userId, Number(page), Number(limit));
    return paginated(result.data, result.total, Number(page), Number(limit));
  });

  app.post('/api/photos/upload', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const data = await request.file();

    if (!data) {
      return reply.status(400).send(fail('No file uploaded'));
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send(fail('Only jpg, png, webp are allowed'));
    }

    const buffer = await data.toBuffer();
    if (buffer.length > 5 * 1024 * 1024) {
      return reply.status(400).send(fail('File too large (max 5MB)'));
    }

    const caption = data.fields.caption as any;
    const photo = await uploadPhoto(userId, buffer, data.filename, caption?.value);
    return reply.status(201).send(ok(photo));
  });

  app.delete('/api/photos/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId as number;
    const { id } = request.params as { id: string };
    const deleted = await deletePhoto(userId, Number(id));
    if (!deleted) return reply.status(404).send(fail('Photo not found'));
    return reply.send(ok(null));
  });
}
