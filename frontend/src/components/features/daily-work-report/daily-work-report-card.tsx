'use client';

import { DailyWorkReport } from '@/types/domain/daily-work-report';
import { Camera, User, Users } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface DailyWorkReportCardProps {
  report: DailyWorkReport;
  onClick?: () => void;
}

export function DailyWorkReportCard({ report, onClick }: DailyWorkReportCardProps) {
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'CERAH':
        return '☀️ Cerah';
      case 'BERAWAN':
        return '☁️ Berawan';
      case 'GERIMIS':
        return '🌦️ Gerimis';
      case 'HUJAN':
        return '🌧️ Hujan';
      default:
        return weather;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 cursor-pointer space-y-2.5'
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{report.logDate}</span>
      </div>

      {/* Info Metadata Bar */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{getWeatherIcon(report.weather)}</span>
        <span>·</span>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Users className="h-3.5 w-3.5 text-muted-foreground" /> {report.laborCount} pekerja
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Camera className="h-3.5 w-3.5 text-primary" /> {report.media.length} foto
        </span>
      </div>

      {/* Notes Text */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {report.notes}
      </p>

      {/* Footer Supervisor Info */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" /> {report.supervisorName}
        </span>
        <span>Klik untuk detail →</span>
      </div>
    </div>
  );
}
