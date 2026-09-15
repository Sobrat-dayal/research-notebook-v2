import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for SaaS Admin and platform access
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system user ID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('member'), // 'admin' | 'member' | 'viewer'
  status: text('status').notNull().default('active'), // 'active' | 'suspended' | 'deleted'
  subscriptionTier: text('subscription_tier').notNull().default('Pro'), // 'Free' | 'Pro' | 'Enterprise'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login').defaultNow().notNull(),
  avatarUrl: text('avatar_url'),
});

// Activity logs tracking user actions, logins, updates
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  action: text('action').notNull(), // e.g. 'LOGIN', 'PAPER_SEARCH', 'SLIDE_GENERATION', 'STATUS_CHANGE', 'ROLE_UPDATE'
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User research notebooks persistence
export const userNotebooks = pgTable('user_notebooks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  field: text('field').default('Computer Science & AI'),
  arxivId: text('arxiv_id'),
  arxivUrl: text('arxiv_url'),
  summaryData: text('summary_data'), // JSON stringified PaperSummary
  sourceCount: integer('source_count').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
  notebooks: many(userNotebooks),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const userNotebooksRelations = relations(userNotebooks, ({ one }) => ({
  user: one(users, {
    fields: [userNotebooks.userId],
    references: [users.id],
  }),
}));
