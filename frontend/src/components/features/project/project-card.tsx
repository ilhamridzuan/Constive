'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, ProjectStatus } from '@/types/domain/project';
import { Activity, ArrowUpRight, Calendar, FileText, MapPin, MoreVertical, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ProjectSettingsDialog } from './project-settings-dialog';

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
  userRole?: string;
}

export function ProjectCard({ project, workspaceId, userRole = 'ADMIN' }: ProjectCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Berjalan';
      case 'COMPLETED':
        return 'Selesai';
      case 'DRAFT':
        return 'Draf';
      case 'ARCHIVED':
        return 'Diarsipkan';
    }
  };

  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

  return (
    <Card className="group flex flex-col justify-between border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight text-foreground line-clamp-1">
              {project.name}
            </CardTitle>
            {project.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{project.location}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground opacity-70 group-hover:opacity-100"
                onClick={() => setSettingsOpen(true)}
                title="Pengaturan Proyek"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-2 text-xs">
        {project.description && (
          <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between font-medium">
            <span className="text-muted-foreground">Progres Pekerjaan:</span>
            <span className="font-semibold text-foreground">{project.progressPercent || 0}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${project.progressPercent || 0}%` }}
            />
          </div>
        </div>

        {/* Counters & Dates */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Jumlah Tugas Gantt">
              <Activity className="h-3 w-3 text-purple-500" /> {project.taskCount || 0} tasks
            </span>
            <span className="flex items-center gap-1" title="Jumlah Laporan Harian">
              <FileText className="h-3 w-3 text-amber-500" /> {project.dailyWorkReportCount || 0} laporan
            </span>
          </div>

          {project.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {new Date(project.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between">
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground gap-1 hover:text-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" /> Pengaturan
          </Button>
        )}

        <Button size="sm" className="h-8 text-xs gap-1 ml-auto" asChild>
          <Link href={`/workspace/${workspaceId}/projects/${project.id}`}>
            Buka Proyek <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>

      <ProjectSettingsDialog
        project={project}
        workspaceId={workspaceId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </Card>
  );
}
