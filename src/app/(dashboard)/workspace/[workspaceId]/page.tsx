'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import {
  Activity,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect } from 'react';

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const { activeWorkspace, setActiveWorkspace, workspaces, fetchWorkspaces } =
    useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (found) setActiveWorkspace(found);
    }
  }, [workspaceId, workspaces, setActiveWorkspace]);

  const mockProjects = [
    {
      id: 'p-1',
      name: 'Pembangunan Menara Sudirman Tower A',
      location: 'Jakarta Selatan',
      progress: 68,
      status: 'ACTIVE',
      updated: '2 jam lalu',
    },
    {
      id: 'p-2',
      name: 'Pekerjaan Jembatan Tol Cikampek II',
      location: 'Karawang, Jawa Barat',
      progress: 42,
      status: 'ACTIVE',
      updated: 'Kemarin',
    },
    {
      id: 'p-3',
      name: 'Renovasi Gedung Perkantoran BSD',
      location: 'Tangerang Selatan',
      progress: 95,
      status: 'ACTIVE',
      updated: '3 hari lalu',
    },
  ];

  const mockActivities = [
    {
      id: 'act-1',
      user: 'Joko Mandor',
      action: 'mengirim Laporan Harian baru',
      target: 'Proyek Menara Sudirman',
      time: '10 menit lalu',
      icon: FileText,
    },
    {
      id: 'act-2',
      user: 'Ahmad PM',
      action: 'memperbarui progres Gantt task #14 (Pengecoran)',
      target: 'Pengecoran Kolom Lt 2',
      time: '1 jam lalu',
      icon: Clock,
    },
    {
      id: 'act-3',
      user: 'Siti Admin',
      action: 'mengundang pengawas2@konstruksi.co.id',
      target: 'Workspace Members',
      time: '3 jam lalu',
      icon: Users,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeWorkspace?.name || 'Workspace Dashboard'}
            </h1>
            <Badge variant="outline">{activeWorkspace?.subscriptionPlan || 'FREE'}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ringkasan aktivitas proyek, laporan harian, dan metrik tim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/workspace/${workspaceId}/settings/members`}>
              <Users className="h-4 w-4" /> Kelola Tim
            </Link>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Proyek Baru
          </Button>
        </div>
      </div>

      {/* Quick Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Proyek Aktif
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% tepat jadwal
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Anggota Tim
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8 / 10</div>
            <p className="text-[11px] text-muted-foreground mt-1">Free seats terpakai</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Laporan Hari Ini
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              3 Terverifikasi PM
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tugas Gantt Berjalan
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-[11px] text-muted-foreground mt-1">Di 5 proyek aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Projects + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Proyek Berjalan
            </h3>
            <span className="text-xs text-primary font-medium hover:underline cursor-pointer">
              Lihat Semua Proyek →
            </span>
          </div>

          <div className="space-y-3">
            {mockProjects.map((p) => (
              <Card key={p.id} className="border-border bg-card hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.location}</p>
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      <div className="w-36 bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="font-medium text-foreground">{p.progress}% Progres</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="gap-1 shrink-0">
                    Buka Proyek <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Aktivitas Terakhir
          </h3>

          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-4">
              {mockActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-foreground">
                        <span className="font-semibold">{act.user}</span> {act.action}{' '}
                        <span className="font-medium text-primary">{act.target}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {act.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
