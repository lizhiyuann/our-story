// 数据库连接管理
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

export { schema };
