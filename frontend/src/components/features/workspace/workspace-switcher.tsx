'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { Workspace } from '@/types/domain/workspace';
import { Building2, Check, ChevronDown, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CreateWorkspaceDialog } from './create-workspace-dialog';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, fetchWorkspaces } =
    useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setIsOpen(false);
    router.push(`/workspace/${ws.id}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 px-2.5 h-9 font-medium hover:bg-muted/80 text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs">
          {activeWorkspace?.name ? activeWorkspace.name[0].toUpperCase() : 'C'}
        </div>
        <span className="max-w-[140px] truncate text-xs font-semibold">
          {activeWorkspace?.name || 'Pilih Workspace'}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Search Bar */}
          <div className="flex items-center rounded-md border border-input px-2.5 py-1 mb-2 bg-muted/30">
            <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari workspace..."
              className="w-full border-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace Anda
          </p>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {filtered.map((ws) => {
              const isSelected = activeWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => handleSelect(ws)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-[10px] py-0">
                      {ws.subscriptionPlan}
                    </Badge>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border pt-1">
            <button
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-primary font-medium hover:bg-primary/10 transition-colors"
              onClick={() => {
                setIsOpen(false);
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Buat Workspace Baru
            </button>
          </div>
        </div>
      )}

      <CreateWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
