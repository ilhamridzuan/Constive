'use client';

import { InviteMemberModal } from '@/components/features/workspace/invite-member-modal';
import { MemberListTable } from '@/components/features/workspace/member-list-table';
import { PendingInvitationsList } from '@/components/features/workspace/pending-invitations-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { CreditCard, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { use, useEffect } from 'react';

export default function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const pathname = usePathname();
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    fetchWorkspaces,
    members,
    invitations,
    activeRole,
  } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (found) setActiveWorkspace(found);
    }
  }, [workspaceId, workspaces, setActiveWorkspace]);

  const tabs = [
    { name: 'Pengaturan Umum', href: `/workspace/${workspaceId}/settings`, icon: Settings },
    { name: 'Anggota Tim', href: `/workspace/${workspaceId}/settings/members`, icon: Users },
    { name: 'Billing & Paket', href: `/workspace/${workspaceId}/settings/billing`, icon: CreditCard },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Anggota Tim & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola anggota tim, undang pengguna baru, dan sesuaikan peran dalam workspace.
          </p>
        </div>

        <InviteMemberModal />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border text-xs font-medium gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Main Members Section */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            Daftar Anggota Aktif <Badge variant="secondary">{members.length}</Badge>
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Workspace: <span className="font-semibold text-foreground">{activeWorkspace?.name}</span>
          </span>
        </CardHeader>

        <CardContent className="space-y-6">
          <MemberListTable members={members} currentRole={activeRole || 'ADMIN'} />

          <PendingInvitationsList invitations={invitations} />
        </CardContent>
      </Card>
    </div>
  );
}
