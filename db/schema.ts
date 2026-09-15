import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const users = sqliteTable('users', {
 id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(),
 password: text('password').notNull(), recovery: text('recovery').notNull(), role: text('role').notNull().default('member'),
 status: text('status').notNull().default('active'), tier: text('tier').notNull().default('Free'),
 created: text('created').notNull(), lastLogin: text('last_login').notNull(),
});
export const sessions = sqliteTable('sessions', { token: text('token').primaryKey(), userId: text('user_id').notNull().references(()=>users.id), expires: integer('expires').notNull() });
export const notebooks = sqliteTable('notebooks', { id: text('id').primaryKey(), userId: text('user_id').notNull().references(()=>users.id), title: text('title').notNull(), updated: text('updated').notNull(), revision: integer('revision').notNull().default(0), tags: text('tags').notNull().default('[]'), storageKey:text('storage_key') });
export const audit = sqliteTable('audit', { id: text('id').primaryKey(), actor: text('actor').notNull(), target: text('target').notNull(), action: text('action').notNull(), created: text('created').notNull() });
export const limits = sqliteTable('limits', { key: text('key').primaryKey(), count: integer('count').notNull().default(0) });
