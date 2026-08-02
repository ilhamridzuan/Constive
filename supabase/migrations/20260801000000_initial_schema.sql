-- ==========================================
-- EXTENSIONS SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TABLE 1: users (User Profiles & Identity)
-- Syncs with Supabase Auth auth.users
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'microsoft')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 2: workspaces (Tenant Root & Subscription)
-- ==========================================
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_free_seats INTEGER NOT NULL DEFAULT 10,
    metadata JSONB DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 3: workspace_members (RBAC Membership)
-- ==========================================
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_user UNIQUE (workspace_id, user_id)
);

-- ==========================================
-- TABLE 4: workspace_invitations (Invite Activation Gate)
-- ==========================================
CREATE TABLE public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    invitee_email VARCHAR(255) NOT NULL,
    assigned_role VARCHAR(50) NOT NULL CHECK (assigned_role IN ('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 5: projects (Construction Projects)
-- ==========================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    start_date DATE,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 6: tasks (WBS Gantt Chart Engine)
-- ==========================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days >= 1),
    parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0),
    wbs_code VARCHAR(50),
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_task_dates CHECK (end_date >= start_date)
);

-- ==========================================
-- TABLE 6b: task_dependencies (Gantt Chart Dependency Relations)
-- ==========================================
CREATE TABLE public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS' CHECK (dependency_type IN ('FS', 'SS', 'FF', 'SF')),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_task_dependency UNIQUE (task_id, depends_on_task_id),
    CONSTRAINT chk_no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- ==========================================
-- TABLE 7: daily_work_reports (Field Operational Logs)
-- ==========================================
CREATE TABLE public.daily_work_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather VARCHAR(50) NOT NULL CHECK (weather IN ('CERAH', 'HUJAN', 'BERAWAN', 'GERIMIS')),
    labor_count INTEGER NOT NULL CHECK (labor_count >= 0),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_date_supervisor UNIQUE (project_id, log_date, supervisor_id)
);

-- ==========================================
-- TABLE 8: daily_work_report_media (Visual Photos Metadata)
-- ==========================================
CREATE TABLE public.daily_work_report_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_work_report_id UUID NOT NULL REFERENCES public.daily_work_reports(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes <= 5242880), -- Max 5 MB
    mime_type VARCHAR(50) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 9: daily_work_report_comments
-- ==========================================
CREATE TABLE public.daily_work_report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_work_report_id UUID NOT NULL REFERENCES public.daily_work_reports(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.daily_work_report_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- FUNCTION & TRIGGER: Sync auth.users → public.users
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, auth_provider, email_verified, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
        COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, false),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- TABLE 10: audit_logs (Security Audit Trail)
-- ==========================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES DEFINITION
-- ==========================================
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_workspaces_slug ON public.workspaces USING btree (slug);
CREATE INDEX idx_workspace_members_user ON public.workspace_members USING btree (user_id);
CREATE INDEX idx_workspace_members_ws ON public.workspace_members USING btree (workspace_id);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations USING btree (token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations USING btree (invitee_email);

CREATE INDEX idx_projects_workspace ON public.projects USING btree (workspace_id);
CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_tasks_project ON public.tasks USING btree (project_id);
CREATE INDEX idx_tasks_workspace ON public.tasks USING btree (workspace_id);
CREATE INDEX idx_tasks_parent ON public.tasks USING btree (parent_id);

CREATE INDEX idx_daily_work_reports_project ON public.daily_work_reports USING btree (project_id);
CREATE INDEX idx_daily_work_reports_workspace ON public.daily_work_reports USING btree (workspace_id);
CREATE INDEX idx_daily_work_reports_supervisor ON public.daily_work_reports USING btree (supervisor_id);
CREATE INDEX idx_daily_work_reports_date ON public.daily_work_reports USING btree (log_date);

CREATE INDEX idx_daily_work_report_media_report ON public.daily_work_report_media USING btree (daily_work_report_id);
CREATE INDEX idx_audit_logs_workspace ON public.audit_logs USING btree (workspace_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);

CREATE INDEX idx_task_dependencies_task ON public.task_dependencies USING btree (task_id);
CREATE INDEX idx_task_dependencies_depends ON public.task_dependencies USING btree (depends_on_task_id);
CREATE INDEX idx_task_dependencies_workspace ON public.task_dependencies USING btree (workspace_id);

CREATE INDEX idx_workspaces_deleted ON public.workspaces USING btree (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_deleted ON public.projects USING btree (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_daily_work_reports_deleted ON public.daily_work_reports USING btree (deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- TRIGGERS SETUP FOR UPDATED_AT
-- ==========================================
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspace_invitations_updated_at BEFORE UPDATE ON public.workspace_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_daily_work_reports_updated_at BEFORE UPDATE ON public.daily_work_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_daily_work_report_comments_updated_at BEFORE UPDATE ON public.daily_work_report_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
