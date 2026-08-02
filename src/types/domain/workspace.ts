export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR';
export type SubscriptionPlan = 'FREE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export interface WorkspaceUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  maxFreeSeats: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  projectCount?: number;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  user: WorkspaceUser;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  invitedBy: string;
  inviteeEmail: string;
  assignedRole: Exclude<WorkspaceRole, 'OWNER'>;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
}

export interface InviteMemberInput {
  email: string;
  role: Exclude<WorkspaceRole, 'OWNER'>;
}

export interface UpdateMemberRoleInput {
  role: WorkspaceRole;
}
