'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/domain/project';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function ProjectDashboardOverviewPage({
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
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-card rounded-lg border border-border" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 bg-card rounded-lg border border-border" />
          <div className="h-36 bg-card rounded-lg border border-border" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Progres WBS Gantt</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-foreground">{project.progressPercent || 0}%</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {project.progressPercent === 100 ? 'Selesai' : 'On Track'}
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Tugas Gantt Chart</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {project.taskCount || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Laporan Harian</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {project.dailyLogCount || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Project Overview Details */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Ringkasan Pekerjaan & Jadwal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {project.description && (
            <p className="text-muted-foreground leading-relaxed text-sm">{project.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Periode Pelaksanaan Proyek:
              </p>
              <p className="text-sm font-semibold text-foreground">
                {project.startDate || 'Belum diatur'} s/d {project.endDate || 'Selesai'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1 font-medium">
                <Users className="h-3.5 w-3.5 text-blue-500" /> Penanggung Jawab / PM:
              </p>
              <p className="text-sm font-semibold text-foreground">Ahmad Dahlan (PM)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" /> Gantt Chart & Schedule WBS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Buka modul Gantt Chart interaktif untuk mengedit durasi, dependensi tugas, dan alur pekerjaan.
            </p>
            <Button size="sm" className="w-full gap-1" asChild>
              <Link href={`/workspace/${workspaceId}/projects/${projectId}/gantt`}>
                Buka Gantt Chart <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" /> Laporan Harian & Foto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Periksa laporan harian dari lapangan, jumlah pekerja, foto progres, dan verifikasi PM.
            </p>
            <Button size="sm" variant="outline" className="w-full gap-1" asChild>
              <Link href={`/workspace/${workspaceId}/projects/${projectId}/daily-logs`}>
                Buka Laporan Harian <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
