'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { WorkspaceMember, WorkspaceRole } from '@/types/domain/workspace';
import { MoreVertical, ShieldAlert, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface MemberListTableProps {
  members: WorkspaceMember[];
  currentRole?: WorkspaceRole;
}

export function MemberListTable({ members, currentRole = 'ADMIN' }: MemberListTableProps) {
  const { updateMemberRole, removeMember } = useWorkspaceStore();
  const isAdminOrOwner = currentRole === 'OWNER' || currentRole === 'ADMIN';

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER':
        return 'warning';
      case 'ADMIN':
        return 'info';
      case 'PROJECT_MANAGER':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER':
        return 'Workspace Owner';
      case 'ADMIN':
        return 'Admin Workspace';
      case 'PROJECT_MANAGER':
        return 'Project Manager';
      case 'SUPERVISOR':
        return 'Pengawas / Mandor';
    }
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Anggota Tim</th>
              <th className="px-4 py-3 font-medium">Peran / Access Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Bergabung</th>
              {isAdminOrOwner && <th className="px-4 py-3 font-medium text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const initials = member.user.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              const isOwner = member.role === 'OWNER';

              return (
                <tr key={member.id} className="h-14 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary text-xs">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm leading-tight">
                          {member.user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    {isAdminOrOwner && !isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={(val) =>
                          updateMemberRole(member.id, val as WorkspaceRole)
                        }
                      >
                        <SelectTrigger className="h-8 w-[170px] text-xs">
                          <SelectValue>{getRoleLabel(member.role)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin Workspace</SelectItem>
                          <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                          <SelectItem value="SUPERVISOR">Pengawas / Mandor</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="h-3 w-3" /> Aktif
                    </span>
                  </td>

                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {isAdminOrOwner && (
                    <td className="px-4 py-2 text-right relative">
                      {!isOwner ? (
                        <div className="inline-block text-left">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setActiveDropdown(activeDropdown === member.id ? null : member.id)
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {activeDropdown === member.id && (
                            <div className="absolute right-4 top-10 z-20 w-44 rounded-md border border-border bg-popover p-1 shadow-md">
                              <button
                                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  removeMember(member.id);
                                  setActiveDropdown(null);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus dari Workspace
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-muted-foreground flex items-center justify-end gap-1">
                          <ShieldAlert className="h-3.5 w-3.5" /> Primary Owner
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
