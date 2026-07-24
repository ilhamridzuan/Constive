'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/domain/project';
import { Save, Settings, Trash2 } from 'lucide-react';
import { use, useEffect, useState } from 'react';

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await projectService.getProjectById(workspaceId, projectId);
      if (data) {
        setProject(data);
        setName(data.name);
        setLocation(data.location || '');
        setDescription(data.description || '');
      }
    }
    load();
  }, [workspaceId, projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await projectService.updateProject(workspaceId, projectId, {
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Pengaturan Identitas Proyek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 max-w-lg text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="set-name">Nama Proyek</Label>
              <Input
                id="set-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-location">Lokasi Proyek</Label>
              <Input
                id="set-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-desc">Deskripsi Proyek</Label>
              <textarea
                id="set-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-muted/30 p-2 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Zona Bahaya Proyek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            Menghapus atau mengarsipkan proyek ini akan mempengaruhi seluruh jadwal Gantt Chart dan Laporan Harian terkait.
          </p>
          <Button variant="destructive" size="sm" className="h-8 text-xs">
            Arsip Proyek Ini
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
