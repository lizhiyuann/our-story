// 倒计时服务：倒计时的 CRUD 操作
import { desc, eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

export async function getCountdowns(userId: number) {
  const db = getDb();
  return db.select().from(schema.countdowns)
    .where(eq(schema.countdowns.userId, userId))
    .orderBy(desc(schema.countdowns.targetDate));
}

export async function createCountdown(userId: number, input: { title: string; targetDate: string; icon?: string }) {
  const db = getDb();
  const [countdown] = await db.insert(schema.countdowns).values({
    userId,
    title: input.title,
    targetDate: new Date(input.targetDate),
    icon: input.icon ?? '❤️',
  }).returning();
  return countdown;
}

export async function deleteCountdown(userId: number, id: number) {
  const db = getDb();
  const deleted = await db.delete(schema.countdowns)
    .where(eq(schema.countdowns.id, id))
    .returning();
  return deleted.length > 0;
}
