'use client';

import { Sheet } from '@/components/ui/sheet';
import { DailyWorkReport } from '@/types/domain/daily-work-report';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

interface DailyWorkReportDetailSheetProps {
  report: DailyWorkReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyWorkReportDetailSheet({
  report,
  open,
  onOpenChange,
}: DailyWorkReportDetailSheetProps) {
  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  if (!report) return null;

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

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={`Laporan Harian — ${report.logDate}`}
        description={`Dibuat oleh ${report.supervisorName}`}
      >
        <div className="space-y-5">
          {/* 3-Column Summary Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-lg border border-border text-center">
            <div>
              <span className="text-[11px] text-muted-foreground block">Cuaca</span>
              <span className="text-xs font-semibold text-foreground">
                {getWeatherLabel(report.weather)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Jumlah Pekerja</span>
              <span className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" /> {report.laborCount} Orang
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Waktu Kirim</span>
              <span className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(report.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Catatan & Kendala Lapangan
            </h4>
            <div className="p-3 bg-card border border-border rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-line">
              {report.notes}
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-primary" /> Dokumentasi Foto ({report.media.length})
              </h4>
              <span className="text-[11px] text-muted-foreground">Klik foto untuk memperbesar</span>
            </div>

            {report.media.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {report.media.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className="relative aspect-square rounded-md overflow-hidden border border-border group hover:ring-2 hover:ring-primary focus:outline-none transition-all"
                  >
                    <img
                      src={item.fileUrl}
                      alt={item.fileName || 'Foto Progres'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-border rounded-md text-xs text-muted-foreground">
                Tidak ada foto terlampir pada laporan ini.
              </div>
            )}
          </div>

          {/* Supervisor Information */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-primary" /> Pelapor: <strong className="text-foreground">{report.supervisorName}</strong>
            </span>
          </div>
        </div>
      </Sheet>

      {/* Full-Screen Lightbox Modal */}
      {activePhotoIndex !== null && report.media[activePhotoIndex] && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Prev */}
          {activePhotoIndex > 0 && (
            <button
              type="button"
              onClick={() => setActivePhotoIndex(activePhotoIndex - 1)}
              className="absolute left-4 text-white hover:text-amber-400 p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Navigation Next */}
          {activePhotoIndex < report.media.length - 1 && (
            <button
              type="button"
              onClick={() => setActivePhotoIndex(activePhotoIndex + 1)}
              className="absolute right-4 text-white hover:text-amber-400 p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main Photo Display */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center space-y-2">
            <img
              src={report.media[activePhotoIndex].fileUrl}
              alt={report.media[activePhotoIndex].fileName || 'Full View'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center text-white text-xs space-y-0.5">
              <p className="font-semibold">
                {report.media[activePhotoIndex].fileName || `Foto ${activePhotoIndex + 1}`}
              </p>
              <p className="text-gray-400">
                Foto {activePhotoIndex + 1} dari {report.media.length} · {report.logDate}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
