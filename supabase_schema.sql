-- Supabase Schema for ACIE

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workspaces Table
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Repositories Table
CREATE TABLE public.repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    installation_id TEXT,
    github_repo_id TEXT,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Telemetry Table
CREATE TABLE public.telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
    pr_number INTEGER NOT NULL,
    pr_title TEXT,
    risk TEXT,
    affected_count INTEGER,
    blast_radius JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Settings Table
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    slack_webhook_url TEXT,
    slack_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (id = auth.uid());

-- workspaces
CREATE POLICY "Users can view their workspaces"
ON public.workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their workspaces"
ON public.workspaces FOR UPDATE
USING (owner_id = auth.uid());

-- repositories
CREATE POLICY "Users can view repos in their workspaces"
ON public.repositories FOR SELECT
USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert repos in their workspaces"
ON public.repositories FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update repos in their workspaces"
ON public.repositories FOR UPDATE
USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

-- telemetry
CREATE POLICY "Users can view telemetry in their workspaces"
ON public.telemetry FOR SELECT
USING (repository_id IN (
    SELECT id FROM public.repositories WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
));

CREATE POLICY "Users can insert telemetry in their workspaces"
ON public.telemetry FOR INSERT
WITH CHECK (repository_id IN (
    SELECT id FROM public.repositories WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
));

CREATE POLICY "Users can update telemetry in their workspaces"
ON public.telemetry FOR UPDATE
USING (repository_id IN (
    SELECT id FROM public.repositories WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
));

-- settings
CREATE POLICY "Users can view settings of their workspaces"
ON public.settings FOR SELECT
USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert settings for their workspaces"
ON public.settings FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update settings of their workspaces"
ON public.settings FOR UPDATE
USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));
