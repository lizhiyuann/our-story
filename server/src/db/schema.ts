import { pgTable, serial, varchar, text, integer, timestamp, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const moods = pgTable('moods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  moodType: varchar('mood_type', { length: 20 }).notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rants = pgTable('rants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rantType: varchar('rant_type', { length: 20 }).notNull(),
  content: text('content').notNull(),
  intensity: integer('intensity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const countdowns = pgTable('countdowns', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  targetDate: timestamp('target_date').notNull(),
  icon: varchar('icon', { length: 10 }).default('❤️').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const photos = pgTable('photos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const timelineEvents = pgTable('timeline_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  eventDate: date('event_date').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 10 }).default('💕').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 10 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
