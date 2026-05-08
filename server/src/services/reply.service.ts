// 回复服务：对任意模块条目的回复 CRUD
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

export async function getReplies(targetType: string, targetId: number) {
  const db = getDb();
  const data = await db.select({
    id: schema.replies.id,
    userId: schema.replies.userId,
    targetType: schema.replies.targetType,
    targetId: schema.replies.targetId,
    content: schema.replies.content,
    createdAt: schema.replies.createdAt,
    displayName: schema.users.displayName,
  })
    .from(schema.replies)
    .leftJoin(schema.users, eq(schema.replies.userId, schema.users.id))
    .where(and(
      eq(schema.replies.targetType, targetType),
      eq(schema.replies.targetId, targetId),
    ))
    .orderBy(desc(schema.replies.createdAt));
  return data;
}

export async function createReply(userId: number, input: { targetType: string; targetId: number; content: string }) {
  const db = getDb();
  const [reply] = await db.insert(schema.replies).values({
    userId,
    targetType: input.targetType,
    targetId: input.targetId,
    content: input.content,
  }).returning();
  return reply;
}

export async function deleteReply(userId: number, id: number) {
  const db = getDb();
  const deleted = await db.delete(schema.replies)
    .where(and(eq(schema.replies.id, id), eq(schema.replies.userId, userId)))
    .returning();
  return deleted.length > 0;
}
