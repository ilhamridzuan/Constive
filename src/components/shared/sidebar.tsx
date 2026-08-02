'use client';

import { useWorkspaceStore } from '@/store/use-workspace-store';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FolderKanban,
  Home,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaceStore();

  // Check if current URL path is inside a specific project (/workspace/[wId]/projects/[pId]...)
  const projectMatch = pathname.match(/\/workspace\/([^/]+)\/projects\/([^/]+)/);
  const isInsideProject = Boolean(projectMatch);

  const wsId = projectMatch?.[1] || activeWorkspace?.id || 'w1234567-89ab-cdef-0123-456789abcdef';

  // Auto-collapse sidebar when a project page is opened
  const [collapsed, setCollapsed] = useState(isInsideProject);

  useEffect(() => {
    if (isInsideProject) {
      setCollapsed(true);
    }
  }, [isInsideProject]);

  // Menu items at Workspace Level Context
  const workspaceNavItems = [
    {
      title: 'Dashboard Workspace',
      href: `/workspace/${wsId}`,
      icon: Home,
      exact: true,
    },
    {
      title: 'Proyek Konstruksi',
      href: `/workspace/${wsId}/projects`,
      icon: FolderKanban,
    },
  ];

  const workspaceSettingsItems = [
    {
      title: 'Anggota Tim',
      href: `/workspace/${wsId}/settings/members`,
      icon: Users,
    },
    {
      title: 'Billing & Paket',
      href: `/workspace/${wsId}/settings/billing`,
      icon: CreditCard,
    },
    {
      title: 'Pengaturan Workspace',
      href: `/workspace/${wsId}/settings`,
      icon: Settings,
      exact: true,
    },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      } h-[calc(100vh-56px)] shrink-0 hidden md:flex`}
    >
      {/* Active Space Header */}
      {!collapsed && (
        <div className="p-4 border-b border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Space
          </p>
          <h3 className="text-xs font-bold text-foreground truncate mt-0.5">
            {activeWorkspace?.name || 'Workspace'}
          </h3>
        </div>
      )}

      {/* Workspace Navigation Items */}
      <div className="flex-1 space-y-4 p-3 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Menu Utama
            </p>
          )}
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Pengaturan & Anggota
            </p>
          )}
          {workspaceSettingsItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-md p-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Sembunyikan Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
