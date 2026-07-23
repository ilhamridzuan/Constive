'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Workspace } from '@/types/domain/workspace';
import { ArrowRight, Building2, FolderKanban, Users } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceCardProps {
  workspace: Workspace;
  userRole?: string;
  onSelect?: (workspace: Workspace) => void;
}

export function WorkspaceCard({ workspace, userRole = 'MEMBER', onSelect }: WorkspaceCardProps) {
  const initials = workspace.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'STANDARD':
        return 'warning';
      case 'PREMIUM':
      case 'ENTERPRISE':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="group relative border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
            {initials || <Building2 className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              {workspace.name}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              slug: {workspace.slug}
            </CardDescription>
          </div>
        </div>
        <Badge variant={getPlanBadgeVariant(workspace.subscriptionPlan)}>
          {workspace.subscriptionPlan}
        </Badge>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{workspace.memberCount ?? 1} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>{workspace.projectCount ?? 0} projects</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
        <span className="text-muted-foreground">
          Role: <span className="font-medium text-foreground">{userRole}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onSelect?.(workspace)}
          asChild
        >
          <Link href={`/workspace/${workspace.id}`}>
            Masuk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
