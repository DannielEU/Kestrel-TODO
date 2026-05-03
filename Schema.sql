CREATE TYPE "role" AS ENUM (
  'admin',
  'member'
);

CREATE TYPE "action" AS ENUM (
  'create',
  'update',
  'delete',
  'assign',
  'unassign'
);

CREATE TYPE "level" AS ENUM (
  'high',
  'normal',
  'low'
);

CREATE TYPE "state" AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'blocked'
);

CREATE TYPE "entity_type" AS ENUM (
  'project',
  'work'
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nickname" varchar UNIQUE,
  "email" varchar UNIQUE,
  "password" varchar,
  "name" varchar,
  "lastname" varchar,
  "birthdate" date,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "workspace" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar,
  "description" text,
  "workspace_id" uuid,
  "created_by" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "workspace_user" (
  "id" uuid PRIMARY KEY  DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "workspace_id" uuid,
  "role" role,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "work" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "state" state,
  "description" text,
  "level" level,
  "project_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "work_user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "work_id" uuid,
  "user_id" uuid,
  "assigned_at" timestamp DEFAULT now()
);

CREATE TABLE "history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" entity_type,
  "entity_id" uuid,
  "user_id" uuid,
  "action" action,
  "field" varchar,
  "old_value" text,
  "new_value" text,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX ON "project" ("workspace_id");

CREATE INDEX ON "project" ("created_by");

CREATE UNIQUE INDEX ON "workspace_user" ("user_id", "workspace_id");

CREATE INDEX ON "workspace_user" ("user_id");

CREATE INDEX ON "workspace_user" ("workspace_id");

CREATE INDEX ON "work" ("project_id");

CREATE UNIQUE INDEX ON "work_user" ("work_id", "user_id");

CREATE INDEX ON "work_user" ("work_id");

CREATE INDEX ON "work_user" ("user_id");

CREATE INDEX ON "history" ("entity_id");

CREATE INDEX ON "history" ("entity_type");

CREATE INDEX ON "history" ("user_id");

ALTER TABLE "workspace_user" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workspace_user" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspace" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "project" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspace" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "project" ADD FOREIGN KEY ("created_by") REFERENCES "user" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "work" ADD FOREIGN KEY ("project_id") REFERENCES "project" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "work_user" ADD FOREIGN KEY ("work_id") REFERENCES "work" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "work_user" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "history" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id") DEFERRABLE INITIALLY IMMEDIATE;
