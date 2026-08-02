'use client';

import { Activity, FileText, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProjectTopTabsProps {
  workspaceId: string;
  projectId: string;
}

export function ProjectTopTabs({ workspaceId, projectId }: ProjectTopTabsProps) {
  const pathname = usePathname();
  const baseUrl = `/workspace/${workspaceId}/projects/${projectId}`;

  const navItems = [
    {
      title: 'Ringkasan',
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
      title: 'Pengaturan',
      href: `${baseUrl}/settings`,
      icon: Settings,
    },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === baseUrl || pathname === `${baseUrl}/`;
    return pathname.startsWith(href);
  };

  return (
    <div className="border-b border-border bg-card/50 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2">
      <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
