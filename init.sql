-- Enums
CREATE TYPE role AS ENUM ('admin', 'member');
CREATE TYPE action AS ENUM ('create', 'update', 'delete', 'assign', 'unassign');
CREATE TYPE level AS ENUM ('high', 'normal', 'low');
CREATE TYPE state AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE entity_type AS ENUM ('project', 'work');

-- Users
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  birthdate DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  description TEXT,
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
  created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS project_workspace_idx ON project(workspace_id);
CREATE INDEX IF NOT EXISTS project_created_by_idx ON project(created_by);

-- Workspace <-> User membership
CREATE TABLE IF NOT EXISTS workspace_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
  role role,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS workspace_user_user_idx ON workspace_user(user_id);
CREATE INDEX IF NOT EXISTS workspace_user_workspace_idx ON workspace_user(workspace_id);

-- Works (tasks)
CREATE TABLE IF NOT EXISTS work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  state state DEFAULT 'pending',
  description TEXT,
  level level DEFAULT 'normal',
  project_id UUID REFERENCES project(id) ON DELETE CASCADE,
  time_estimate VARCHAR(50),
  points INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_project_idx ON work(project_id);

-- Work <-> User assignment
CREATE TABLE IF NOT EXISTS work_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (work_id, user_id)
);

CREATE INDEX IF NOT EXISTS work_user_work_idx ON work_user(work_id);
CREATE INDEX IF NOT EXISTS work_user_user_idx ON work_user(user_id);

-- Tags (workspace-scoped reusable labels)
CREATE TABLE IF NOT EXISTS tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Work <-> Tag mapping
CREATE TABLE IF NOT EXISTS work_tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tag(id) ON DELETE CASCADE,
  UNIQUE (work_id, tag_id)
);

CREATE INDEX IF NOT EXISTS work_tag_work_idx ON work_tag(work_id);

-- Comments on works
CREATE TABLE IF NOT EXISTS comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comment_work_idx ON comment(work_id);
CREATE INDEX IF NOT EXISTS comment_user_idx ON comment(user_id);

-- History / audit log
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type,
  entity_id UUID,
  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  action action,
  field VARCHAR(255),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS history_entity_idx ON history(entity_id);
CREATE INDEX IF NOT EXISTS history_entity_type_idx ON history(entity_type);
CREATE INDEX IF NOT EXISTS history_user_idx ON history(user_id);
