'use client';

import { Activity, FileText, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProjectSidebarNavProps {
  workspaceId: string;
  projectId: string;
}

export function ProjectSidebarNav({ workspaceId, projectId }: ProjectSidebarNavProps) {
  const pathname = usePathname();
  const baseUrl = `/workspace/${workspaceId}/projects/${projectId}`;

  const navItems = [
    {
      title: 'Ringkasan Proyek',
      href: baseUrl,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Gantt Chart WBS',
      href: `${baseUrl}/gantt`,
      icon: Activity,
    },
    {
      title: 'Laporan Harian',
      href: `${baseUrl}/daily-work-reports`,
      icon: FileText,
    },
    {
      title: 'Pengaturan Proyek',
      href: `${baseUrl}/settings`,
      icon: Settings,
    },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-row md:flex-col gap-1 w-full md:w-52 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 shrink-0 border-b md:border-b-0 md:border-r border-border pr-0 md:pr-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isLinkActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap ${
              active
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
