// 心情服务：心情记录的 CRUD 操作
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

export async function getMoods(userId: number, page = 1, limit = 20) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const data = await db.select().from(schema.moods)
    .where(eq(schema.moods.userId, userId))
    .orderBy(desc(schema.moods.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(schema.moods)
    .where(eq(schema.moods.userId, userId));

  return { data, total: Number(count) };
}

export async function createMood(userId: number, input: { moodType: string; emoji: string; content: string }) {
  const db = getDb();
  const [mood] = await db.insert(schema.moods).values({
    userId,
    moodType: input.moodType,
    emoji: input.emoji,
    content: input.content,
  }).returning();
  return mood;
}

export async function deleteMood(userId: number, id: number) {
  const db = getDb();
  const deleted = await db.delete(schema.moods)
    .where(and(eq(schema.moods.id, id), eq(schema.moods.userId, userId)))
    .returning();
  return deleted.length > 0;
}
