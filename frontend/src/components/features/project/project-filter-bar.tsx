'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectStatus } from '@/types/domain/project';
import { LayoutGrid, List, Search } from 'lucide-react';

interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ProjectStatus | 'ALL';
  onStatusChange: (status: ProjectStatus | 'ALL') => void;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

export function ProjectFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode = 'grid',
  onViewModeChange,
}: ProjectFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari nama atau lokasi proyek..."
          className="pl-9 h-9 text-xs"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => onStatusChange(val as ProjectStatus | 'ALL')}
        >
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue placeholder="Status Proyek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif Berjalan</SelectItem>
            <SelectItem value="DRAFT">Draf / Plan</SelectItem>
            <SelectItem value="COMPLETED">Selesai</SelectItem>
            <SelectItem value="ARCHIVED">Diarsipkan</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle Button */}
        {onViewModeChange && (
          <div className="flex rounded-md border border-border bg-muted/40 p-0.5">
            <button
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('grid')}
              title="Tampilan Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('table')}
              title="Tampilan Tabel"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
