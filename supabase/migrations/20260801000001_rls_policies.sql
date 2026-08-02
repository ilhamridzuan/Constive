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
-- SECURITY DEFINER FUNCTIONS (To prevent infinite recursion)
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_workspace_access(ws_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_workspace_role(ws_id uuid, required_roles text[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid() AND role::text = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    USING ( auth.uid() = owner_id OR public.has_workspace_access(id) );

CREATE POLICY "Tenant Isolation: Update Workspace"
    ON public.workspaces FOR UPDATE
    USING ( public.has_workspace_role(id, ARRAY['OWNER', 'ADMIN']) );

CREATE POLICY "Users can create workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- ==========================================
-- RLS POLICIES FOR: workspace_members
-- ==========================================
CREATE POLICY "Tenant Isolation: View Members"
    ON public.workspace_members FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Add Members"
    ON public.workspace_members FOR INSERT
    WITH CHECK (
        -- Allow if adding themselves as OWNER (happens during workspace creation)
        (user_id = auth.uid() AND role = 'OWNER') 
        OR 
        -- Or if they are already an OWNER or ADMIN of the workspace
        public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN'])
    );

CREATE POLICY "Tenant Isolation: Update Members"
    ON public.workspace_members FOR UPDATE
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']) );

CREATE POLICY "Tenant Isolation: Remove Members"
    ON public.workspace_members FOR DELETE
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']) );

-- ==========================================
-- RLS POLICIES FOR: workspace_invitations
-- ==========================================
CREATE POLICY "Tenant Isolation: View Invitations"
    ON public.workspace_invitations FOR SELECT
    USING ( true ); -- Allow querying by token from API Route

CREATE POLICY "Tenant Isolation: Manage Invitations"
    ON public.workspace_invitations FOR ALL
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']) );

-- ==========================================
-- RLS POLICIES FOR: projects
-- ==========================================
CREATE POLICY "Tenant Isolation: View Projects"
    ON public.projects FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Create/Update Projects"
    ON public.projects FOR ALL
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER']) );

-- ==========================================
-- RLS POLICIES FOR: tasks (Gantt Chart Engine)
-- ==========================================
CREATE POLICY "Tenant Isolation: View Tasks"
    ON public.tasks FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Manage Tasks"
    ON public.tasks FOR ALL
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER']) );

-- ==========================================
-- RLS POLICIES FOR: task_dependencies
-- ==========================================
CREATE POLICY "Tenant Isolation: View Task Dependencies"
    ON public.task_dependencies FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Manage Task Dependencies"
    ON public.task_dependencies FOR INSERT
    WITH CHECK ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER']) );

CREATE POLICY "Tenant Isolation: Delete Task Dependencies"
    ON public.task_dependencies FOR DELETE
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER']) );

-- ==========================================
-- RLS POLICIES FOR: daily_work_reports & daily_work_report_media
-- ==========================================
CREATE POLICY "Tenant Isolation: View Daily Logs"
    ON public.daily_work_reports FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Create/Update Daily Logs"
    ON public.daily_work_reports FOR ALL
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']) );

CREATE POLICY "Tenant Isolation: View Daily Log Media"
    ON public.daily_work_report_media FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Manage Daily Log Media"
    ON public.daily_work_report_media FOR ALL
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']) );

-- ==========================================
-- RLS POLICIES FOR: daily_work_report_comments
-- ==========================================
CREATE POLICY "Tenant Isolation: View Comments"
    ON public.daily_work_report_comments FOR SELECT
    USING ( public.has_workspace_access(workspace_id) );

CREATE POLICY "Tenant Isolation: Create Comments"
    ON public.daily_work_report_comments FOR INSERT
    WITH CHECK ( public.has_workspace_access(workspace_id) AND auth.uid() = user_id );

CREATE POLICY "Tenant Isolation: Update Comments"
    ON public.daily_work_report_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Tenant Isolation: Delete Comments"
    ON public.daily_work_report_comments FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin Moderation: Delete Any Comment"
    ON public.daily_work_report_comments FOR DELETE
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']) );

-- ==========================================
-- RLS POLICIES FOR: audit_logs
-- ==========================================
CREATE POLICY "Tenant Isolation: View Audit Logs"
    ON public.audit_logs FOR SELECT
    USING ( public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']) );
