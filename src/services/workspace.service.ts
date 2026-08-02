import {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
} from '@/types/domain/workspace';

// Initial Mock Data for development & fallback
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'w1234567-89ab-cdef-0123-456789abcdef',
    name: 'PT Konstruksi Jaya Utama',
    slug: 'pt-konstruksi-jaya-utama',
    ownerId: 'u-1',
    subscriptionPlan: 'FREE',
    isActive: true,
    maxFreeSeats: 10,
    memberCount: 8,
    projectCount: 5,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-23T00:00:00Z',
  },
  {
    id: 'w2222222-89ab-cdef-0123-456789abcdef',
    name: 'Pembangunan Menara Sudirman',
    slug: 'pembangunan-menara-sudirman',
    ownerId: 'u-1',
    subscriptionPlan: 'STANDARD',
    isActive: true,
    maxFreeSeats: 10,
    memberCount: 15,
    projectCount: 12,
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-07-22T00:00:00Z',
  },
];

const MOCK_MEMBERS: Record<string, WorkspaceMember[]> = {
  'w1234567-89ab-cdef-0123-456789abcdef': [
    {
      id: 'wm-1',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      userId: 'u-1',
      role: 'OWNER',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
      user: {
        id: 'u-1',
        email: 'owner@konstruksi.co.id',
        fullName: 'Budi Santoso (Owner)',
      },
    },
    {
      id: 'wm-2',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      userId: 'u-2',
      role: 'ADMIN',
      createdAt: '2026-07-02T00:00:00Z',
      updatedAt: '2026-07-02T00:00:00Z',
      user: {
        id: 'u-2',
        email: 'admin@konstruksi.co.id',
        fullName: 'Siti Rahma',
      },
    },
    {
      id: 'wm-3',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      userId: 'u-3',
      role: 'PROJECT_MANAGER',
      createdAt: '2026-07-05T00:00:00Z',
      updatedAt: '2026-07-05T00:00:00Z',
      user: {
        id: 'u-3',
        email: 'pm.ahmad@konstruksi.co.id',
        fullName: 'Ahmad Dahlan',
      },
    },
    {
      id: 'wm-4',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      userId: 'u-4',
      role: 'SUPERVISOR',
      createdAt: '2026-07-10T00:00:00Z',
      updatedAt: '2026-07-10T00:00:00Z',
      user: {
        id: 'u-4',
        email: 'mandor.joko@konstruksi.co.id',
        fullName: 'Joko Widodo',
      },
    },
  ],
};

const MOCK_INVITATIONS: Record<string, WorkspaceInvitation[]> = {
  'w1234567-89ab-cdef-0123-456789abcdef': [
    {
      id: 'inv-1',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      invitedBy: 'u-1',
      inviteeEmail: 'pengawas2@konstruksi.co.id',
      assignedRole: 'SUPERVISOR',
      token: 'token-inv-12345',
      status: 'PENDING',
      expiresAt: '2026-07-30T00:00:00Z',
      createdAt: '2026-07-20T00:00:00Z',
      updatedAt: '2026-07-20T00:00:00Z',
    },
  ],
};

export const workspaceService = {
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const res = await fetch('/api/v1/workspaces');
      if (res.ok) {
        const data = await res.json();
        return data.workspaces || data;
      }
    } catch {
      // API fallback
    }
    return MOCK_WORKSPACES;
  },

  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }
    const found = MOCK_WORKSPACES.find((w) => w.id === workspaceId);
    return found || MOCK_WORKSPACES[0];
  },

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      const res = await fetch('/api/v1/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, slug }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }
    const newWs: Workspace = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name,
      slug,
      ownerId: 'u-1',
      subscriptionPlan: 'FREE',
      isActive: true,
      maxFreeSeats: 10,
      memberCount: 1,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!MOCK_WORKSPACES.some((w) => w.id === newWs.id)) {
      MOCK_WORKSPACES.unshift(newWs);
    }
    return newWs;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members`);
      if (res.ok) {
        const data = await res.json();
        return data.members || data;
      }
    } catch {
      // API fallback
    }
    return MOCK_MEMBERS[workspaceId] || MOCK_MEMBERS['w1234567-89ab-cdef-0123-456789abcdef'];
  },

  async inviteMember(
    workspaceId: string,
    input: InviteMemberInput
  ): Promise<WorkspaceInvitation> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const token = `inv_${Math.random().toString(36).substring(2, 10)}`;
    const newInv: WorkspaceInvitation = {
      id: `inv-${Date.now()}`,
      workspaceId,
      invitedBy: 'u-1',
      inviteeEmail: input.email,
      assignedRole: input.role,
      token,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!MOCK_INVITATIONS[workspaceId]) {
      MOCK_INVITATIONS[workspaceId] = [];
    }
    MOCK_INVITATIONS[workspaceId].unshift(newInv);
    return newInv;
  },

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    input: UpdateMemberRoleInput
  ): Promise<WorkspaceMember> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const members = MOCK_MEMBERS[workspaceId] || MOCK_MEMBERS['w1234567-89ab-cdef-0123-456789abcdef'];
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx !== -1) {
      members[idx].role = input.role;
      members[idx].updatedAt = new Date().toISOString();
      return members[idx];
    }
    throw new Error('Member tidak ditemukan');
  },

  async removeMember(workspaceId: string, memberId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // API fallback
    }

    if (MOCK_MEMBERS[workspaceId]) {
      MOCK_MEMBERS[workspaceId] = MOCK_MEMBERS[workspaceId].filter((m) => m.id !== memberId);
    }
    return true;
  },

  async getPendingInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/invitations`);
      if (res.ok) {
        const data = await res.json();
        return data.invitations || data;
      }
    } catch {
      // API fallback
    }
    return MOCK_INVITATIONS[workspaceId] || MOCK_INVITATIONS['w1234567-89ab-cdef-0123-456789abcdef'] || [];
  },

  async revokeInvitation(workspaceId: string, invitationId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // API fallback
    }

    if (MOCK_INVITATIONS[workspaceId]) {
      MOCK_INVITATIONS[workspaceId] = MOCK_INVITATIONS[workspaceId].filter((i) => i.id !== invitationId);
    }
    return true;
  },

  async resendInvitation(workspaceId: string, invitationId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // API fallback
    }
    return true;
  },
};
