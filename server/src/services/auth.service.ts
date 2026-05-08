import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { Env } from '../config/env.js';

export async function seedUsers(env: Env) {
  const db = getDb();

  for (const user of [
    { username: env.USER1_USERNAME, password: env.USER1_PASSWORD, displayName: env.USER1_DISPLAY_NAME },
    { username: env.USER2_USERNAME, password: env.USER2_PASSWORD, displayName: env.USER2_DISPLAY_NAME },
  ]) {
    const existing = await db.select().from(schema.users).where(eq(schema.users.username, user.username)).limit(1);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      await db.insert(schema.users).values({
        username: user.username,
        passwordHash,
        displayName: user.displayName,
      });
      console.log(`Seeded user: ${user.username}`);
    }
  }
}

export async function authenticateUser(username: string, password: string) {
  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  return { id: user.id, username: user.username, displayName: user.displayName };
}

export async function getUserById(id: number) {
  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return user ?? null;
}
