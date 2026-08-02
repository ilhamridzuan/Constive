'use client';

import { CreateWorkspaceDialog } from '@/components/features/workspace/create-workspace-dialog';
import { WorkspaceCard } from '@/components/features/workspace/workspace-card';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { Building2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WorkspaceSelectionPage() {
  const { workspaces, fetchWorkspaces, isLoadingWorkspaces } = useWorkspaceStore();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Ruang Kerja (Workspace) Anda
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih ruang kerja untuk mengelola proyek konstruksi, tim, dan laporan harian.
          </p>
        </div>

        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      {/* Workspaces Grid */}
      {isLoadingWorkspaces ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-lg border border-border bg-card animate-pulse p-4" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} userRole="Admin Workspace" />
          ))}

          {/* Create New Workspace Card CTA */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex min-h-[170px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Buat Workspace Baru</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
              Tambah ruang kerja baru untuk entitas bisnis atau proyek berbeda.
            </p>
          </button>
        </div>
      )}
    </div>
  );
}
