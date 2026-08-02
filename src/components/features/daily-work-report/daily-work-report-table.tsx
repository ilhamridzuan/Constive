'use client';

import { Button } from '@/components/ui/button';
import { DailyWorkReport } from '@/types/domain/daily-work-report';
import { Camera, Eye } from 'lucide-react';
import React from 'react';

interface DailyWorkReportTableProps {
  reports: DailyWorkReport[];
  onSelectReport: (report: DailyWorkReport) => void;
}

export function DailyWorkReportTable({
  reports,
  onSelectReport,
}: DailyWorkReportTableProps) {
  const getWeatherLabel = (weather: string) => {
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

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-lg bg-card text-muted-foreground space-y-2">
        <p className="text-sm font-medium">Belum ada laporan harian untuk proyek ini.</p>
        <p className="text-xs">
          Klik tombol &quot;Buat Laporan Baru&quot; untuk mengisi laporan harian dari lokasi proyek.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <th className="px-4 py-3 font-semibold">Tanggal</th>
            <th className="px-4 py-3 font-semibold">Pengawas</th>
            <th className="px-4 py-3 font-semibold">Cuaca & Pekerja</th>
            <th className="px-4 py-3 font-semibold">Catatan Lapangan</th>
            <th className="px-4 py-3 font-semibold">Foto</th>
            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((report) => (
            <tr key={report.id} className="h-14 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2 font-bold text-foreground">{report.logDate}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {report.supervisorName.charAt(0)}
                  </div>
                  <span className="font-medium text-foreground">{report.supervisorName}</span>
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">{getWeatherLabel(report.weather)}</div>
                  <div className="text-[11px] text-muted-foreground">{report.laborCount} pekerja</div>
                </div>
              </td>
              <td className="px-4 py-2 max-w-[240px]">
                <p className="truncate text-muted-foreground">{report.notes}</p>
              </td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-1 font-medium text-foreground bg-muted px-2 py-1 rounded">
                  <Camera className="h-3 w-3 text-primary" /> {report.media.length}
                </span>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onSelectReport(report)}
                    title="Lihat Detail"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Detail
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
