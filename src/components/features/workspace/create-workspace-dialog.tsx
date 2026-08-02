'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CreateWorkspaceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ trigger, open: externalOpen, onOpenChange }: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createWorkspace } = useWorkspaceStore();
  const router = useRouter();

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama workspace tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newWs = await createWorkspace(name.trim(), slug);
      setOpen(false);
      setName('');
      setSlug('');
      router.push(`/workspace/${newWs.id}`);
    } catch {
      setError('Gagal membuat workspace. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            trigger ? (
              (trigger as React.ReactElement)
            ) : (
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Workspace Baru
              </Button>
            )
          }
        />
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Workspace Baru</DialogTitle>
          <DialogDescription>
            Ruang kerja terpisah untuk mengelola tim, proyek konstruksi, dan laporan harian.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ws-name">
              Nama Workspace <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ws-name"
              placeholder="Contoh: PT Konstruksi Jaya Utama"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-slug">Identifier URL (Slug)</Label>
            <div className="flex items-center rounded-md border border-input bg-muted/50 px-3 text-xs text-muted-foreground">
              <span className="shrink-0 font-mono">constive.com/</span>
              <Input
                id="ws-slug"
                className="border-0 bg-transparent px-1 font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="pt-konstruksi-jaya"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Slug digunakan sebagai URL unik ruang kerja Anda.
            </p>
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
              {isSubmitting ? 'Membuat...' : 'Buat Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
