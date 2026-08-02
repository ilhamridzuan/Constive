# Backend Implementation Roadmap

This document outlines the detailed backend implementation plan for the Constive Construction Management Platform. It is strictly organized feature by feature as per the PRD and TDD, covering database operations, Server Actions/API Routes, TanStack Query integration, and security checks for each module.

## Global Execution Rules

> [!WARNING]
> Before executing any step in this plan, you must strictly cross-reference the [Product Requirement Document_ Constive.md](file:///c:/Users/Ridzuan/Personal%20Projects/Constive/docs/Product%20Requirement%20Document_%20Constive.md) and [Technical Design Document_ Constive.md](file:///c:/Users/Ridzuan/Personal%20Projects/Constive/docs/Technical%20Design%20Document_%20Constive.md) to ensure alignment with the system architecture. Additionally, you must always utilize `context7` to retrieve the most up-to-date and valid official documentation for the tech stack before writing any code.

## Proposed Changes

### 1. Authentication & User Identity Management (FT-004)

**Database Operations & RLS (Supabase):**
- **Trigger**: `on_auth_user_created` automatically inserts a record into `public.users` when a user signs up via Supabase Auth.
- **RLS Policies**: The `public.users` table implements RLS so that users can only read and update their own profile (`auth.uid() = id`).

**Next.js Server Actions & API Routes:**
- **Server Actions (`src/actions/auth.actions.ts`)**:
  - `signUpAction`: Wrapper around `supabase.auth.signUp` handling metadata.
  - `signInAction`: Wrapper around `supabase.auth.signInWithPassword`.
  - `signOutAction`: Wrapper around `supabase.auth.signOut`.
  - `resetPasswordAction`: Wrapper around `supabase.auth.resetPasswordForEmail`.
  - `magicLinkAction`: Wrapper around `supabase.auth.signInWithOtp`.
- **API Routes**:
  - `src/app/auth/callback/route.ts`: A `GET` handler to exchange the auth code for a session cookie during OAuth flows and email verification.

**Data Fetching & Mutation (TanStack Query):**
- **Mutations (`useMutation`)**:
  - `useSignUpMutation`, `useSignInMutation`, `useSignOutMutation` interacting directly with the Server Actions.
- **Queries (`useQuery`)**:
  - `useCurrentUser`: Fetches the current authenticated user's session and profile data.

**Security & Authorization Checks:**
- **Next.js Middleware (`middleware.ts`)**: Validates the session cookie via `@supabase/ssr` on every request. Refreshes the token automatically via token rotation. Redirects unauthenticated users to `/login`.
- **Server Actions**: All Server Actions must verify `await supabase.auth.getUser()` to ensure the user is authenticated before executing business logic.

---

### 2. Workspace & Member Management (FT-001)

**Database Operations & RLS (Supabase):**
- **Tables**: `workspaces`, `workspace_members`, `workspace_invitations`.
- **RLS Policies**:
  - Tenant Isolation: Users can only read/update workspaces they are members of.
  - Role-based Isolation: Only users with `OWNER` or `ADMIN` roles can update workspace details, invite members, or modify roles.

**Next.js Server Actions & API Routes:**
- **Server Actions (`src/actions/workspace.actions.ts`)**:
  - `createWorkspace`: Inserts into `workspaces` and automatically adds the creator as `OWNER` in `workspace_members`.
  - `inviteMember`: Generates a token, inserts into `workspace_invitations`, and triggers an invite email.
  - `acceptInvite`: Validates the token, inserts the user into `workspace_members`, and updates the invite status.
  - `updateMemberRole` / `removeMember`: Updates or deletes members from `workspace_members`.
- **API Routes**:
  - `api/workspaces/invitations/[token]/route.ts`: Used to validate a token when a user clicks the invite link *before* rendering the sign-up/login gate (ensuring the token is valid).

**Data Fetching & Mutation (TanStack Query):**
- **Queries (`useQuery`)**:
  - `useWorkspaces`: Fetches all workspaces for the current user.
  - `useWorkspaceMembers(workspaceId)`: Fetches members of a specific workspace.
  - `useWorkspaceInvitations(workspaceId)`: Fetches pending invitations.
- **Mutations (`useMutation`)**:
  - `useCreateWorkspace`, `useInviteMember`, `useUpdateMemberRole`, `useAcceptInvite`.
- **Optimistic Updates**: For member role changes and workspace creations, TanStack Query will immediately update the local cache before server confirmation.

**Security & Authorization Checks:**
- **RBAC Checks**: In `inviteMember` and `updateMemberRole`, the server must verify that the current user has the `OWNER` or `ADMIN` role in `workspace_members` for the specific `workspaceId`.
- **Quota Validation**: Before creating a new member/invite, check if the workspace is on the `FREE` plan and whether it exceeds the 10-user limit.

---

### 3. Interactive Gantt Chart & Task Management (FT-002)

**Database Operations & RLS (Supabase):**
- **Tables**: `projects`, `tasks`, `task_dependencies`.
- **RLS Policies**:
  - Tenant Isolation: Users can only read/write tasks and projects where the `workspace_id` matches a workspace they belong to.
- **Transactions**: Batch reordering or updating WBS codes may require a Supabase RPC or executing sequential updates in a Next.js Server Action carefully to maintain integrity.

**Next.js Server Actions & API Routes:**
- **Server Actions (`src/actions/project.actions.ts`, `src/actions/gantt.actions.ts`, `src/actions/task-dependency.actions.ts`)**:
  - `createTask`: Handles inserting the task and computing the initial WBS code based on parent and siblings.
  - `updateTaskGantt`: Updates `start_date`, `end_date`, `duration_days`, `parent_id`.
  - `batchReorderTasks`: Updates `order_index` for multiple tasks simultaneously.
  - `addDependency`, `removeDependency`.
  - **Broadcast Engine**: Server Actions use `supabaseRealtimeWrapper.broadcastEvent` to send changes to connected clients immediately after a successful DB update.

**Data Fetching & Mutation (TanStack Query):**
- **Queries (`useQuery`)**:
  - `useProjectTasks(projectId)`: Fetches the hierarchical task list and dependencies.
- **Mutations (`useMutation`)**:
  - `useUpdateTaskGantt`, `useAddDependency`.
- **Optimistic UI (`onMutate`)**: Extremely critical for Gantt dragging. When a user drags a task, TanStack Query immediately updates the cache, rendering the new date locally. If the mutation fails, it rolls back using `onError`.
- **Realtime Sync (`useEffect` + Supabase Channels)**: Listens for broadcast events via WebSockets to invalidate or update the TanStack Query cache dynamically when other PMs make changes.

**Security & Authorization Checks:**
- **RBAC Checks**: Only `OWNER`, `ADMIN`, or `PROJECT_MANAGER` can mutate tasks and projects. `SUPERVISOR` has read-only access to Gantt features.
- Validate `start_date` <= `end_date`.
- Ensure no circular dependencies are formed when adding a dependency.

---

### 4. Smart Daily Work Reports & Media (FT-003)

**Database Operations & RLS (Supabase):**
- **Tables**: `daily_work_reports`, `daily_work_report_media`, `daily_work_report_comments`.
- **RLS Policies**:
  - Read: All members of the workspace can read the reports.
  - Insert: Supervisors can only insert reports where `supervisor_id` is their own ID.
  - Edit/Delete Comments: Users can only edit/delete their own comments. Owner/Admin can moderate (delete) any comment.

**Next.js Server Actions & API Routes:**
- **Server Actions (`src/actions/daily-work-report.actions.ts`)**:
  - `createComment`, `editComment`, `deleteComment`.
- **API Routes (`src/app/api/workspaces/[wId]/projects/[pId]/daily-work-reports/route.ts`)**:
  - Because photo uploads involve `FormData` and binary files up to 5MB (max 10 files), a standard Next.js API Route (`POST`) is used over Server Actions for better multipart payload handling.
  - The route validates files, uploads them via `supabaseStorageWrapper.uploadFile()`, inserts the report into `daily_work_reports`, and inserts URLs into `daily_work_report_media`.

**Data Fetching & Mutation (TanStack Query):**
- **Queries (`useInfiniteQuery` / `useQuery`)**:
  - `useDailyReports(projectId)`: Infinite scroll pagination for fetching historical reports.
  - `useReportComments(reportId)`: Fetches threaded comments for a specific report.
- **Mutations (`useMutation`)**:
  - `useSubmitDailyReport`: Uses standard `fetch` to send `FormData` (text data + binary photos) to the API route.
  - `useAddComment`, `useEditComment`, `useDeleteComment`.

**Security & Authorization Checks:**
- **File Validation**: Validate MIME type (JPG, PNG) and file size (max 5MB) on both client and server side. Enforce max 10 photos limit.
- **RBAC Checks**: Verify the user has access to the workspace and the specific project.
- **Data Integrity**: Require at least 1 photo per report submission as per constraints.


