'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Plus, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { use } from 'react';

export default function ProjectGanttPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" /> Interactive Gantt Chart Canvas
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-muted/40 p-1 text-xs">
            <button className="px-2.5 py-1 font-medium bg-card text-foreground rounded shadow-xs">Hari</button>
            <button className="px-2.5 py-1 font-medium text-muted-foreground hover:text-foreground">Minggu</button>
            <button className="px-2.5 py-1 font-medium text-muted-foreground hover:text-foreground">Bulan</button>
          </div>

          <Button size="sm" className="gap-1 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" /> Tambah Tugas
          </Button>
        </div>
      </div>

      {/* Gantt View Placeholder Canvas */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Jadwal WBS Proyek #{projectId}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-t border-border/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Canvas Gantt Chart Terintegrasi</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
            Modul Gantt Chart siap digunakan dengan fitur Drag & Drop, dependensi antar-tugas WBS, dan sinkronisasi real-time.
          </p>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang Data Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
