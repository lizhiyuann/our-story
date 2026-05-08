// AI 服务：调用 Python Agent 处理聊天
import { desc, eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://ai-service:8000';

export async function chat(userId: number, message: string): Promise<string> {
  const db = getDb();

  // Save user message
  await db.insert(schema.chatMessages).values({ userId, role: 'user', content: message });

  // Get recent history for context
  const history = await db.select().from(schema.chatMessages)
    .where(eq(schema.chatMessages.userId, userId))
    .orderBy(desc(schema.chatMessages.createdAt))
    .limit(20);

  history.reverse();

  let reply: string;

  try {
    const res = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id: userId,
        history: history.map(m => ({ role: m.role, content: m.content })),
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) throw new Error(`AI service returned ${res.status}`);

    const data = await res.json() as { reply: string; source: string };
    reply = data.reply;
  } catch (error) {
    console.error('AI service error:', error);
    reply = getFallbackResponse(message);
  }

  // Save assistant reply
  await db.insert(schema.chatMessages).values({ userId, role: 'assistant', content: reply });

  return reply;
}

export async function getChatHistory(userId: number, limit = 50) {
  const db = getDb();
  const messages = await db.select().from(schema.chatMessages)
    .where(eq(schema.chatMessages.userId, userId))
    .orderBy(desc(schema.chatMessages.createdAt))
    .limit(limit);

  messages.reverse();
  return messages;
}

function getFallbackResponse(message: string): string {
  const fallbacks: Record<string, string[]> = {
    '你好': ['你好呀！今天也要开心哦~ 💕', '嗨！想我了吗？🥰'],
    '爱你': ['我也爱你！超级超级爱你！❤️❤️❤️', '爱你哦！永远爱你！💕'],
    '想你': ['我也好想你呀！🥺', '每时每刻都在想你！'],
    '难过': ['怎么了？告诉我，我陪你~ 🥺', '抱抱！别难过了，有我在呢！💕'],
    '生气': ['别生气啦！消消气~ 😤', '是谁惹你生气了？'],
    '累了': ['累了就休息一下吧~ 🛋️', '辛苦了！注意身体哦~'],
    '早安': ['早安宝贝！今天也要元气满满哦！☀️'],
    '晚安': ['晚安宝贝！做个好梦~ 🌙'],
  };
  const defaults = ['嗯嗯，我在听呢~ 继续说！', '我在呢！随时都在~ 💕', '好的好的！还有什么想说的吗？'];

  const msg = message.toLowerCase();
  for (const [keyword, replies] of Object.entries(fallbacks)) {
    if (msg.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return defaults[Math.floor(Math.random() * defaults.length)];
}
