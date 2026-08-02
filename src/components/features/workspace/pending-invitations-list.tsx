'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { WorkspaceInvitation } from '@/types/domain/workspace';
import { Clock, Mail, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';

interface PendingInvitationsListProps {
  invitations: WorkspaceInvitation[];
}

export function PendingInvitationsList({ invitations }: PendingInvitationsListProps) {
  const { revokeInvitation, resendInvitation } = useWorkspaceStore();
  const [resendingId, setResendingId] = useState<string | null>(null);

  if (invitations.length === 0) return null;

  const handleResend = async (id: string) => {
    setResendingId(id);
    await resendInvitation(id);
    setTimeout(() => setResendingId(null), 1000);
  };

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" /> Undangan Belum Diterima ({invitations.length})
        </h4>
        <span className="text-xs text-muted-foreground">Menunggu konfirmasi penerima</span>
      </div>

      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">{inv.inviteeEmail}</p>
                <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] py-0">
                    Role: {inv.assignedRole}
                  </Badge>
                  <span>
                    Kadaluwarsa:{' '}
                    {new Date(inv.expiresAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1"
                disabled={resendingId === inv.id}
                onClick={() => handleResend(inv.id)}
              >
                <RefreshCw className={`h-3 w-3 ${resendingId === inv.id ? 'animate-spin' : ''}`} />
                {resendingId === inv.id ? 'Terkirim...' : 'Kirim Ulang'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-destructive hover:bg-destructive/10 gap-1"
                onClick={() => revokeInvitation(inv.id)}
              >
                <XCircle className="h-3 w-3" /> Batalkan
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
