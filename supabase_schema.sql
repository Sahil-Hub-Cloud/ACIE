-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  github_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. Create Workspaces Table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Repositories Table
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  installation_id BIGINT NOT NULL,
  github_repo_id BIGINT NOT NULL,
  full_name TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  is_active BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(installation_id, github_repo_id)
);

-- 4. Create Telemetry Table (The PR Data)
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  pr_number INTEGER NOT NULL,
  pr_title TEXT,
  pr_author TEXT,
  pr_url TEXT,
  risk TEXT CHECK (risk IN ('LOW', 'MEDIUM', 'HIGH')),
  affected_count INTEGER DEFAULT 0,
  blast_radius JSONB DEFAULT '[]',
  files_changed INTEGER DEFAULT 0,
  health_score INTEGER,
  security_score INTEGER,
  root_cause TEXT,
  suggested_fix TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row-Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies (The "Trust" Layer)
-- Users can only see their own data
CREATE POLICY "Users can only view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Workspaces are tied to the owner
CREATE POLICY "Workspaces are isolated by owner" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

-- Repositories belong to the user's workspace
CREATE POLICY "Repositories are isolated by workspace owner" ON repositories
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Telemetry is strictly tied to the user's repository
CREATE POLICY "Telemetry is isolated by repository owner" ON telemetry
  FOR ALL USING (
    repository_id IN (
      SELECT r.id FROM repositories r
      JOIN workspaces w ON w.id = r.workspace_id
      WHERE w.owner_id = auth.uid()
    )
  );
