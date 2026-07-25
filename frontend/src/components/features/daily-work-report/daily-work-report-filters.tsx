'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailyWorkReportFilter, WeatherCondition } from '@/types/domain/daily-work-report';
import { Filter, Search } from 'lucide-react';
import React from 'react';

interface DailyWorkReportFiltersProps {
  filter: DailyWorkReportFilter;
  onChange: (filter: DailyWorkReportFilter) => void;
}

export function DailyWorkReportFilters({ filter, onChange }: DailyWorkReportFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cari catatan, tanggal, atau nama pengawas..."
          value={filter.searchQuery || ''}
          onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />

        {/* Weather Dropdown */}
        <Select
          value={filter.weather || 'ALL'}
          onValueChange={(val) =>
            onChange({ ...filter, weather: val as WeatherCondition | 'ALL' })
          }
        >
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Cuaca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Cuaca</SelectItem>
            <SelectItem value="CERAH">☀️ Cerah</SelectItem>
            <SelectItem value="BERAWAN">☁️ Berawan</SelectItem>
            <SelectItem value="GERIMIS">🌦️ Gerimis</SelectItem>
            <SelectItem value="HUJAN">🌧️ Hujan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
