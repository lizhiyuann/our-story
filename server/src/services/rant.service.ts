import { desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

export async function getRants(userId: number, page = 1, limit = 20) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const data = await db.select().from(schema.rants)
    .where(eq(schema.rants.userId, userId))
    .orderBy(desc(schema.rants.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(schema.rants)
    .where(eq(schema.rants.userId, userId));

  return { data, total: Number(count) };
}

export async function createRant(userId: number, input: { rantType: string; content: string; intensity: number }) {
  const db = getDb();
  const [rant] = await db.insert(schema.rants).values({
    userId,
    rantType: input.rantType,
    content: input.content,
    intensity: input.intensity,
  }).returning();
  return rant;
}

export async function deleteRant(userId: number, id: number) {
  const db = getDb();
  const deleted = await db.delete(schema.rants)
    .where(eq(schema.rants.id, id))
    .returning();
  return deleted.length > 0;
}
