'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/domain/project';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await projectService.getProjectById(workspaceId, projectId);
      setProject(data);
      setLoading(false);
    }
    load();
  }, [workspaceId, projectId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-card rounded-lg border border-border" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <h2 className="text-lg font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <Button className="mt-4" asChild>
          <Link href={`/workspace/${workspaceId}/projects`}>Kembali ke Daftar Proyek</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb Back Link */}
      <div>
        <Link
          href={`/workspace/${workspaceId}/projects`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Proyek
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <Badge variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            {project.location && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {project.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" /> Pengaturan
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href={`/workspace/${workspaceId}/projects/${projectId}/gantt`}>
                <Activity className="h-4 w-4" /> Interactive Gantt Chart
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress & Overview Header Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          {project.description && (
            <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Tanggal Pelaksanaan
              </p>
              <p className="text-sm font-semibold text-foreground">
                {project.startDate || 'Belum diatur'} — {project.endDate || 'Selesai'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-purple-500" /> Progres WBS Gantt
              </p>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${project.progressPercent || 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground">{project.progressPercent || 0}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-amber-500" /> Total Dokumentasi
              </p>
              <p className="text-sm font-semibold text-foreground">
                {project.dailyLogCount || 0} Laporan Harian
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Modules Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" /> Gantt Chart & Jadwal WBS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Kelola durasi tugas, dependensi antar-pekerjaan, dan kolaborasi tim secara interaktif.
            </p>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={`/workspace/${workspaceId}/projects/${projectId}/gantt`}>
                Buka Canvas Gantt Chart
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" /> Laporan Harian & Foto Lapangan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Lihat laporan harian dari pengawas, verifikasi pekerjaan, dan periksa dokumentasi foto.
            </p>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={`/workspace/${workspaceId}/projects/${projectId}/daily-logs`}>
                Lihat Laporan Harian Proyek
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
