'use client';

import { ProjectTopTabs } from '@/components/features/project/project-top-tabs';
import { Badge } from '@/components/ui/badge';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/domain/project';
import { ArrowLeft, Building2, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Breadcrumb & Context Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href={`/workspace/${workspaceId}/projects`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Proyek
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {loading ? 'Memuat...' : project?.name || 'Detail Proyek'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {loading ? 'Memuat Proyek...' : project?.name}
              </h1>
              {project && (
                <Badge variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {project.status === 'ACTIVE'
                    ? 'Berjalan'
                    : project.status === 'COMPLETED'
                    ? 'Selesai'
                    : project.status}
                </Badge>
              )}
            </div>
            {project?.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {project.location}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>ID Proyek: <span className="font-mono text-foreground">{projectId}</span></span>
          </div>
        </div>

        {/* GitHub-style Horizontal Top Navigation Tabs */}
        <ProjectTopTabs workspaceId={workspaceId} projectId={projectId} />
      </div>

      {/* Main Project Content View */}
      <div className="w-full">{children}</div>
    </div>
  );
}

