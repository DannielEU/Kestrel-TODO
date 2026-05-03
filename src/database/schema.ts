import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'member']);

export const actionEnum = pgEnum('action', [
  'create',
  'update',
  'delete',
  'assign',
  'unassign',
]);

export const levelEnum = pgEnum('level', ['high', 'normal', 'low']);

export const stateEnum = pgEnum('state', [
  'pending',
  'in_progress',
  'completed',
  'blocked',
]);

export const entityTypeEnum = pgEnum('entity_type', ['project', 'work']);

/* =========================
   TABLES
========================= */

export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  nickname: varchar('nickname').unique().notNull(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  lastname: varchar('lastname', { length: 255 }).notNull(),
  birthdate: date('birthdate'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workspaces = pgTable('workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projects = pgTable(
  'project',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }),
    description: text('description'),
    workspaceId: uuid('workspace_id').references(() => workspaces.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => ({
    workspaceIdx: index('project_workspace_idx').on(table.workspaceId),
    createdByIdx: index('project_created_by_idx').on(table.createdBy),
  }),
);

export const workspaceUsers = pgTable(
  'workspace_user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    workspaceId: uuid('workspace_id').references(() => workspaces.id),
    role: roleEnum('role'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniqueUserWorkspace: uniqueIndex('workspace_user_unique').on(
      table.userId,
      table.workspaceId,
    ),
    userIdx: index('workspace_user_user_idx').on(table.userId),
    workspaceIdx: index('workspace_user_workspace_idx').on(
      table.workspaceId,
    ),
  }),
);

export const works = pgTable(
  'work',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    state: stateEnum('state'),
    description: text('description'),
    level: levelEnum('level'),
    projectId: uuid('project_id').references(() => projects.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdx: index('work_project_idx').on(table.projectId),
  }),
);

export const workUsers = pgTable(
  'work_user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workId: uuid('work_id').references(() => works.id),
    userId: uuid('user_id').references(() => users.id),
    assignedAt: timestamp('assigned_at').defaultNow(),
  },
  (table) => ({
    uniqueWorkUser: uniqueIndex('work_user_unique').on(
      table.workId,
      table.userId,
    ),
    workIdx: index('work_user_work_idx').on(table.workId),
    userIdx: index('work_user_user_idx').on(table.userId),
  }),
);

export const history = pgTable(
  'history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: entityTypeEnum('entity_type'),
    entityId: uuid('entity_id'),
    userId: uuid('user_id').references(() => users.id),
    action: actionEnum('action'),
    field: varchar('field', { length: 255 }),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    entityIdx: index('history_entity_idx').on(table.entityId),
    entityTypeIdx: index('history_entity_type_idx').on(table.entityType),
    userIdx: index('history_user_idx').on(table.userId),
  }),
);