// 时间轴服务：事件的 CRUD 操作
import { desc, eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

export async function getTimeline(userId: number) {
  const db = getDb();
  return db.select().from(schema.timelineEvents)
    .where(eq(schema.timelineEvents.userId, userId))
    .orderBy(desc(schema.timelineEvents.eventDate));
}

export async function createTimelineEvent(userId: number, input: { eventDate: string; title: string; description?: string; icon?: string }) {
  const db = getDb();
  const [event] = await db.insert(schema.timelineEvents).values({
    userId,
    eventDate: input.eventDate,
    title: input.title,
    description: input.description ?? null,
    icon: input.icon ?? '💕',
  }).returning();
  return event;
}

export async function deleteTimelineEvent(userId: number, id: number) {
  const db = getDb();
  const deleted = await db.delete(schema.timelineEvents)
    .where(eq(schema.timelineEvents.id, id))
    .returning();
  return deleted.length > 0;
}
