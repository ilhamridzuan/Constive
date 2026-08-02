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
import { useProjectStore } from '@/store/use-project-store';
import { Project, ProjectStatus } from '@/types/domain/project';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectSettingsDialogProps {
  project: Project | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSettingsDialog({
  project,
  workspaceId,
  open,
  onOpenChange,
}: ProjectSettingsDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { updateProject, deleteProject } = useProjectStore();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setLocation(project.location || '');
      setDescription(project.description || '');
      setStatus(project.status);
      setStartDate(project.startDate || '');
      setEndDate(project.endDate || '');
      setConfirmDelete(false);
    }
  }, [project]);

  if (!project) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama proyek tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateProject(workspaceId, project.id, {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        status,
        startDate,
        endDate,
      });

      onOpenChange(false);
    } catch {
      setError('Gagal memperbarui proyek. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteProject(workspaceId, project.id);
      onOpenChange(false);
    } catch {
      setError('Gagal menghapus proyek.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Proyek</DialogTitle>
          <DialogDescription>
            Ubah detail proyek, perbarui status pekerjaan, atau arsipkan proyek ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nama Proyek</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Lokasi Proyek</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-start">Tanggal Mulai</Label>
              <Input
                id="edit-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-end">Target Selesai</Label>
              <Input
                id="edit-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-status">Status Proyek</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif Berjalan</SelectItem>
                <SelectItem value="DRAFT">Draf / Perencanaan</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="ARCHIVED">Diarsipkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-2 border-t border-border">
            {!confirmDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-1 text-xs"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus Proyek Ini
              </Button>
            ) : (
              <div className="rounded-md bg-destructive/10 p-3 space-y-2 border border-destructive/20 text-xs">
                <p className="font-semibold text-destructive">
                  Apakah Anda yakin ingin menghapus proyek ini?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Ya, Hapus Permanen
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
