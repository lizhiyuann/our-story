import { desc, eq, sql } from 'drizzle-orm';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { getDb, schema } from '../db/index.js';

const UPLOAD_DIR = '/app/uploads';
const THUMB_DIR = '/app/uploads/thumbnails';

async function ensureDirs() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
}

export async function uploadPhoto(userId: number, file: Buffer, originalName: string, caption?: string) {
  await ensureDirs();

  const ext = path.extname(originalName) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const thumbFilename = `thumb-${filename}`;

  const filePath = path.join(UPLOAD_DIR, filename);
  const thumbnailPath = path.join(THUMB_DIR, thumbFilename);

  // Save original (resize if > 2000px wide)
  const image = sharp(file);
  const metadata = await image.metadata();
  if ((metadata.width ?? 0) > 2000) {
    await image.resize(2000, undefined, { withoutEnlargement: true }).toFile(filePath);
  } else {
    await image.toFile(filePath);
  }

  // Generate thumbnail (400px wide)
  await sharp(file).resize(400, undefined, { withoutEnlargement: true }).toFile(thumbnailPath);

  const db = getDb();
  const [photo] = await db.insert(schema.photos).values({
    userId,
    filePath: `/uploads/${filename}`,
    thumbnailPath: `/uploads/thumbnails/${thumbFilename}`,
    caption: caption ?? null,
  }).returning();

  return photo;
}

export async function getPhotos(userId: number, page = 1, limit = 20) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const data = await db.select().from(schema.photos)
    .where(eq(schema.photos.userId, userId))
    .orderBy(desc(schema.photos.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(schema.photos)
    .where(eq(schema.photos.userId, userId));

  return { data, total: Number(count) };
}

export async function deletePhoto(userId: number, id: number) {
  const db = getDb();
  const [photo] = await db.select().from(schema.photos).where(eq(schema.photos.id, id)).limit(1);
  if (!photo) return false;

  // Delete files
  try {
    const fullPath = path.join('/app', photo.filePath);
    await fs.unlink(fullPath).catch(() => {});
    if (photo.thumbnailPath) {
      const thumbPath = path.join('/app', photo.thumbnailPath);
      await fs.unlink(thumbPath).catch(() => {});
    }
  } catch {
    // File may already be deleted
  }

  await db.delete(schema.photos).where(eq(schema.photos.id, id));
  return true;
}
