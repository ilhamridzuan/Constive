'use client';

import { CreateProjectDialog } from '@/components/features/project/create-project-dialog';
import { ProjectCard } from '@/components/features/project/project-card';
import { ProjectFilterBar } from '@/components/features/project/project-filter-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProjectStore } from '@/store/use-project-store';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { ProjectStatus } from '@/types/domain/project';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const { activeWorkspace, setActiveWorkspace, workspaces, fetchWorkspaces, activeRole } =
    useWorkspaceStore();
  const {
    projects,
    fetchProjects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isLoading,
  } = useProjectStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (found) setActiveWorkspace(found);
    }
    fetchProjects(workspaceId);
  }, [workspaceId, workspaces, setActiveWorkspace, fetchProjects]);

  const canCreate = activeRole === 'OWNER' || activeRole === 'ADMIN' || activeRole === 'PROJECT_MANAGER';

  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> Proyek Konstruksi
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola seluruh proyek konstruksi, jadwal Gantt Chart, dan progres di workspace{' '}
            <span className="font-semibold text-foreground">{activeWorkspace?.name}</span>.
          </p>
        </div>

        {canCreate && (
          <CreateProjectDialog
            workspaceId={workspaceId}
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
        )}
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Proyek</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{totalCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Proyek Aktif</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Proyek Selesai</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {completedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <ProjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          fetchProjects(workspaceId);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          fetchProjects(workspaceId);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Projects List Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-lg border border-border bg-card animate-pulse p-4" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Tidak Ada Proyek Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            Belum ada proyek yang sesuai dengan kriteria pencarian atau status yang dipilih.
          </p>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Buat Proyek Baru
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              workspaceId={workspaceId}
              userRole={activeRole || 'ADMIN'}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama Proyek</th>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progres</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((proj) => (
                  <tr key={proj.id} className="h-14 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-semibold text-foreground">{proj.name}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{proj.location || '-'}</td>
                    <td className="px-4 py-2">
                      <Badge variant={proj.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {proj.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 font-medium">{proj.progressPercent || 0}%</td>
                    <td className="px-4 py-2 text-right">
                      <Button size="sm" variant="ghost" className="gap-1 text-xs" asChild>
                        <Link href={`/workspace/${workspaceId}/projects/${proj.id}`}>
                          Buka Proyek <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
