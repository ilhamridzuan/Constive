import { z } from 'zod';
import { WorkspaceRole } from '@/types/domain/workspace';

export const createWorkspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  slug: z.string().min(3).max(100).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']),
  workspaceId: z.string().uuid(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const acceptInviteSchema = z.object({
  token: z.string(),
});
