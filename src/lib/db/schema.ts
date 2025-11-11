import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  jsonb, 
  integer,
  date,
  varchar,
  primaryKey
} from 'drizzle-orm/pg-core';

// Users table for NextAuth.js
export const users = pgTable('users', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  role: text('role', { enum: ['teacher', 'student', 'admin'] }).default('student'),
  classIds: jsonb('classIds').$type<string[]>().default([]),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compositePk: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (verificationToken) => ({
  compositePk: primaryKey({
    columns: [verificationToken.identifier, verificationToken.token],
  }),
}));

// WordSets table as per technical specification
export const wordSets = pgTable('wordsets', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  startDate: date('startDate'),
  endDate: date('endDate'),
  items: jsonb('items').$type<Array<{
    word: string;
    image?: string;
    order: number;
  }>>(),
  createdBy: varchar('createdBy', { length: 255 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  active: boolean('active').default(false),
});

// Submissions table as per technical specification
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  studentId: varchar('studentId', { length: 255 }),
  wordId: integer('wordId'),
  word: varchar('word', { length: 255 }),
  imageURL: varchar('imageURL', { length: 1024 }),
  pngThumbURL: varchar('pngThumbURL', { length: 1024 }),
  strokeData: jsonb('strokeData').$type<Array<{
    color: string;
    size: number;
    points: Array<[number, number]>;
  }>>(),
  autoScore: jsonb('autoScore').$type<{
    confidence: number;
    label: string;
  }>(),
  teacherScore: jsonb('teacherScore').$type<{
    rating: number;
    reviewedBy: string;
    reviewedAt: string;
  }>(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

// Classes table for organizing students and teachers
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  teacherId: text('teacherId').references(() => users.id),
  studentIds: jsonb('studentIds').$type<string[]>().default([]),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WordSet = typeof wordSets.$inferSelect;
export type NewWordSet = typeof wordSets.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;