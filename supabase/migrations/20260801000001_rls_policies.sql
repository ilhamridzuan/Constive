-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_report_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR: users
-- ==========================================
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ==========================================
-- RLS POLICIES FOR: workspaces
-- ==========================================
CREATE POLICY "Tenant Isolation: View Workspaces"
    ON public.workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspaces.id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Update Workspace"
    ON public.workspaces FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspaces.id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: workspace_members
-- ==========================================
CREATE POLICY "Tenant Isolation: View Members"
    ON public.workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Add Members"
    ON public.workspace_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Tenant Isolation: Update Members"
    ON public.workspace_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Tenant Isolation: Remove Members"
    ON public.workspace_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: projects
-- ==========================================
CREATE POLICY "Tenant Isolation: View Projects"
    ON public.projects FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Create/Update Projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.projects.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: tasks (Gantt Chart Engine)
-- ==========================================
CREATE POLICY "Tenant Isolation: View Tasks"
    ON public.tasks FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Tasks"
    ON public.tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.tasks.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: task_dependencies
-- ==========================================
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: View Task Dependencies"
    ON public.task_dependencies FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Task Dependencies"
    ON public.task_dependencies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.task_dependencies.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

CREATE POLICY "Tenant Isolation: Delete Task Dependencies"
    ON public.task_dependencies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.task_dependencies.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: daily_work_reports & daily_work_report_media
-- ==========================================
CREATE POLICY "Tenant Isolation: View Daily Logs"
    ON public.daily_work_reports FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Create/Update Daily Logs"
    ON public.daily_work_reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.daily_work_reports.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')
        )
    );

CREATE POLICY "Tenant Isolation: View Daily Log Media"
    ON public.daily_work_report_media FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Daily Log Media"
    ON public.daily_work_report_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.daily_work_report_media.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: daily_work_report_comments
-- ==========================================
CREATE POLICY "Tenant Isolation: View Comments"
    ON public.daily_work_report_comments FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Create Comments"
    ON public.daily_work_report_comments FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
        AND auth.uid() = user_id
    );

CREATE POLICY "Tenant Isolation: Update Comments"
    ON public.daily_work_report_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Tenant Isolation: Delete Comments"
    ON public.daily_work_report_comments FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin Moderation: Delete Any Comment"
    ON public.daily_work_report_comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.daily_work_report_comments.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: audit_logs
-- ==========================================
CREATE POLICY "Tenant Isolation: View Audit Logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.audit_logs.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );
