import { billingService } from '@/services/billing.service';
import { workspaceService } from '@/services/workspace.service';
import { SeatQuotaUsage, SubscriptionDetails } from '@/types/domain/billing';
import { Workspace, WorkspaceInvitation, WorkspaceMember, WorkspaceRole } from '@/types/domain/workspace';
import { create } from 'zustand';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeRole: WorkspaceRole | null;
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  subscription: SubscriptionDetails | null;
  quota: SeatQuotaUsage | null;

  isLoadingWorkspaces: boolean;
  isLoadingMembers: boolean;
  isLoadingSubscription: boolean;
  error: string | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  fetchMembers: (workspaceId: string) => Promise<void>;
  fetchSubscription: (workspaceId: string) => Promise<void>;

  createWorkspace: (name: string, slug?: string) => Promise<Workspace>;
  inviteMember: (email: string, role: Exclude<WorkspaceRole, 'OWNER'>) => Promise<WorkspaceInvitation>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  activeRole: null,
  members: [],
  invitations: [],
  subscription: null,
  quota: null,

  isLoadingWorkspaces: false,
  isLoadingMembers: false,
  isLoadingSubscription: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      const rawList = await workspaceService.getWorkspaces();
      const list = Array.from(new Map(rawList.map((w) => [w.id, w])).values());
      const currentActive = get().activeWorkspace;
      const active = currentActive ? list.find((w) => w.id === currentActive.id) || list[0] : list[0];

      set({ workspaces: list, activeWorkspace: active, isLoadingWorkspaces: false });
      if (active) {
        get().setActiveWorkspace(active);
      }
    } catch {
      set({ isLoadingWorkspaces: false, error: 'Gagal memuat daftar workspace' });
    }
  },

  setActiveWorkspace: async (workspace: Workspace) => {
    set({ activeWorkspace: workspace });
    await Promise.all([
      get().fetchMembers(workspace.id),
      get().fetchSubscription(workspace.id),
    ]);
  },

  fetchMembers: async (workspaceId: string) => {
    set({ isLoadingMembers: true });
    try {
      const [members, invitations] = await Promise.all([
        workspaceService.getWorkspaceMembers(workspaceId),
        workspaceService.getPendingInvitations(workspaceId),
      ]);

      // Simple mock current user role check
      const currentMember = members[0];
      set({
        members,
        invitations,
        activeRole: currentMember?.role || 'ADMIN',
        isLoadingMembers: false,
      });

      // Recalculate seat quotas
      const breakdown: Record<WorkspaceRole, number> = { OWNER: 0, ADMIN: 0, PROJECT_MANAGER: 0, SUPERVISOR: 0 };
      members.forEach((m) => {
        if (breakdown[m.role] !== undefined) breakdown[m.role]++;
      });

      const currentSub = get().subscription;
      const quota = await billingService.calculateQuotaUsage(
        members.length,
        breakdown,
        currentSub?.plan || 'FREE'
      );
      set({ quota });
    } catch {
      set({ isLoadingMembers: false });
    }
  },

  fetchSubscription: async (workspaceId: string) => {
    set({ isLoadingSubscription: true });
    try {
      const sub = await billingService.getSubscriptionDetails(workspaceId);
      set({ subscription: sub, quota: sub.quota, isLoadingSubscription: false });
    } catch {
      set({ isLoadingSubscription: false });
    }
  },

  createWorkspace: async (name: string, slug?: string) => {
    const newWs = await workspaceService.createWorkspace({ name, slug });
    const rawList = [...get().workspaces, newWs];
    const list = Array.from(new Map(rawList.map((w) => [w.id, w])).values());
    set({ workspaces: list });
    await get().setActiveWorkspace(newWs);
    return newWs;
  },

  inviteMember: async (email: string, role: Exclude<WorkspaceRole, 'OWNER'>) => {
    const activeWs = get().activeWorkspace;
    if (!activeWs) throw new Error('Tidak ada workspace aktif');

    const inv = await workspaceService.inviteMember(activeWs.id, { email, role });
    set({ invitations: [inv, ...get().invitations] });
    return inv;
  },

  updateMemberRole: async (memberId: string, role: WorkspaceRole) => {
    const activeWs = get().activeWorkspace;
    if (!activeWs) return;

    const updated = await workspaceService.updateMemberRole(activeWs.id, memberId, { role });
    const members = get().members.map((m) => (m.id === memberId ? updated : m));
    set({ members });
  },

  removeMember: async (memberId: string) => {
    const activeWs = get().activeWorkspace;
    if (!activeWs) return;

    await workspaceService.removeMember(activeWs.id, memberId);
    set({ members: get().members.filter((m) => m.id !== memberId) });
  },

  revokeInvitation: async (invitationId: string) => {
    const activeWs = get().activeWorkspace;
    if (!activeWs) return;

    await workspaceService.revokeInvitation(activeWs.id, invitationId);
    set({ invitations: get().invitations.filter((i) => i.id !== invitationId) });
  },

  resendInvitation: async (invitationId: string) => {
    const activeWs = get().activeWorkspace;
    if (!activeWs) return;

    await workspaceService.resendInvitation(activeWs.id, invitationId);
  },
}));
