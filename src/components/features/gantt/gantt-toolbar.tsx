'use client';

import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/types/domain/task';
import { ViewMode } from 'gantt-task-react';
import {
  Activity,
  ChevronsDown,
  ChevronsUp,
  Filter,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useState } from 'react';

interface GanttToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  statusFilter: TaskStatus | 'ALL';
  onStatusFilterChange: (status: TaskStatus | 'ALL') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onRefresh: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
}

export function GanttToolbar({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
  isFullScreen,
  onToggleFullScreen,
  isAllExpanded = true,
  onToggleExpandAll,
}: GanttToolbarProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-2xs">
      {/* Title & Status */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 leading-tight">
            Gantt Chart & Jadwal WBS
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Perencanaan interaktif & sinkronisasi real-time
          </p>
        </div>
      </div>

      {/* Controls Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        {showSearch ? (
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36 sm:w-48"
              autoFocus
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowSearch(true)}
            title="Cari tugas"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}

        {/* Status Filter */}
        <div className="relative flex items-center">
          <Filter className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as TaskStatus | 'ALL')}
            className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="TODO">Belum Dimulai (TODO)</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
            <option value="COMPLETED">Selesai</option>
          </select>
        </div>

        {/* Zoom View Mode Toggle */}
        <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange(ViewMode.Day)}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === ViewMode.Day
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hari
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(ViewMode.Week)}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === ViewMode.Week
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Minggu
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(ViewMode.Month)}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === ViewMode.Month
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bulan
          </button>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRefresh}
          title="Muat ulang data"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        {/* FullScreen toggle if supported */}
        {onToggleFullScreen && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hidden sm:flex"
            onClick={onToggleFullScreen}
            title={isFullScreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
          >
            {isFullScreen ? (
              <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        )}

        {/* Expand All / Collapse All Action */}
        {onToggleExpandAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpandAll}
            className="h-8 gap-1.5 text-xs font-medium border-border hover:bg-accent"
            title={isAllExpanded ? 'Sembunyikan Seluruh Hirarki' : 'Buka Seluruh Hirarki'}
          >
            {isAllExpanded ? (
              <>
                <ChevronsUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronsDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Expand All</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
