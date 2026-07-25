'use client';

import { Badge } from '@/components/ui/badge';
import { DailyLog, DailyLogStatus } from '@/types/domain/daily-log';
import { Camera, AlertTriangle, User, Users } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface DailyLogCardProps {
  log: DailyLog;
  onClick?: () => void;
}

export function DailyLogCard({ log, onClick }: DailyLogCardProps) {
  const getStatusBadge = (status: DailyLogStatus) => {
    switch (status) {
      case 'VERIFIED_PM':
        return <Badge variant="success">Verifikasi PM</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Menunggu PM</Badge>;
      case 'REVISION_REQUESTED':
        return <Badge variant="warning">Minta Revisi</Badge>;
      case 'DRAFT_LOG':
        return <Badge variant="outline">Draf</Badge>;
      case 'ARCHIVED':
        return <Badge variant="secondary">Arsip</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        'p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 cursor-pointer space-y-2.5',
        log.status === 'REVISION_REQUESTED' && 'border-amber-500/50 bg-amber-500/5'
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{log.logDate}</span>
        <div>{getStatusBadge(log.status)}</div>
      </div>

      {/* Info Metadata Bar */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{getWeatherIcon(log.weather)}</span>
        <span>·</span>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Users className="h-3.5 w-3.5 text-muted-foreground" /> {log.laborCount} pekerja
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Camera className="h-3.5 w-3.5 text-primary" /> {log.media.length} foto
        </span>
      </div>

      {/* Notes Text */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {log.notes}
      </p>

      {/* Revision Request Notes Banner */}
      {log.status === 'REVISION_REQUESTED' && log.revisionNotes && (
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-900 dark:text-amber-100 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Catatan Revisi PM:</span>
            <span>{log.revisionNotes}</span>
          </div>
        </div>
      )}

      {/* Footer Supervisor Info */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" /> {log.supervisorName}
        </span>
        <span>Klik untuk detail →</span>
      </div>
    </div>
  );
}
