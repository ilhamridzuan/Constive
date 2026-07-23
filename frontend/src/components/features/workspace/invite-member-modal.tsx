'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { WorkspaceRole } from '@/types/domain/workspace';
import { AlertTriangle, Check, Copy, Loader2, Mail, QrCode, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface InviteMemberModalProps {
  trigger?: React.ReactNode;
}

export function InviteMemberModal({ trigger }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<WorkspaceRole, 'OWNER'>>('SUPERVISOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { activeWorkspace, inviteMember, quota } = useWorkspaceStore();

  const inviteLink = activeWorkspace
    ? `https://constive.com/accept-invite?token=invite_${activeWorkspace.slug}_field`
    : '';

  const totalMembers = quota?.totalActiveMembers ?? 1;
  const maxFree = quota?.maxFreeSeats ?? 10;
  const isNearLimit = totalMembers >= maxFree - 2 && totalMembers < maxFree;
  const isLimitExceeded = totalMembers >= maxFree;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    if (isLimitExceeded && role !== 'SUPERVISOR') {
      setError('Kuota pengguna paket Free telah tercapai. Upgrade ke paket Standard.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await inviteMember(email.trim(), role);
      setOpen(false);
      setEmail('');
    } catch {
      setError('Gagal mengirim undangan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Undang Anggota
            </Button>
          )
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Tim Baru</DialogTitle>
          <DialogDescription>
            Tambahkan anggota ke workspace <span className="font-semibold text-foreground">{activeWorkspace?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-border text-xs font-medium">
          <button
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="h-3.5 w-3.5" /> Undangan Email
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('link')}
          >
            <QrCode className="h-3.5 w-3.5" /> Tautan & QR Code Lapangan
          </button>
        </div>

        {activeTab === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isNearLimit && (
              <Alert variant="warning" className="text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Peringatan Kuota Free Seats</AlertTitle>
                <AlertDescription>
                  Workspace ini telah menggunakan {totalMembers}/{maxFree} kuota free seats.
                </AlertDescription>
              </Alert>
            )}

            {isLimitExceeded && (
              <Alert variant="destructive" className="text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Kuota Free Limit Tercapai</AlertTitle>
                <AlertDescription>
                  Kuota pengguna paket Free ({maxFree} seats) telah tercapai. Lakukan upgrade ke paket Standard untuk menambah anggota admin/PM.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="invite-email">
                Alamat Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="nama@perusahaan.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Peran & Akses</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Exclude<WorkspaceRole, 'OWNER'>)}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERVISOR">Pengawas / Mandor (Akses Lapangan - Free)</SelectItem>
                  <SelectItem value="PROJECT_MANAGER">Project Manager (Akses Gantt & Log - Paid)</SelectItem>
                  <SelectItem value="ADMIN">Admin Workspace (Akses Penuh - Paid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Mengirim...' : 'Kirim Undangan'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Pindai QR code ini di lokasi proyek atau salin tautan untuk mengundang pengawas & mandor secara cepat.
            </p>

            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border-2 border-primary/30 bg-white p-2 shadow-inner">
              {/* Clean SVG Mock QR Code */}
              <svg viewBox="0 0 100 100" className="h-full w-full fill-slate-900">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" />

                <rect x="40" y="10" width="20" height="10" />
                <rect x="40" y="30" width="10" height="30" />
                <rect x="60" y="40" width="30" height="10" />
                <rect x="40" y="70" width="20" height="20" />
                <rect x="70" y="70" width="20" height="20" />
              </svg>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Input value={inviteLink} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1 shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
                Tutup
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
