'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
  DailyWorkReport,
  DailyWorkReportStatus,
} from '@/types/domain/daily-work-report';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  User,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

interface DailyWorkReportDetailSheetProps {
  report: DailyWorkReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify?: (reportId: string) => void;
  onRequestRevision?: (reportId: string, notes: string) => void;
  isPM?: boolean;
}

export function DailyWorkReportDetailSheet({
  report,
  open,
  onOpenChange,
  onVerify,
  onRequestRevision,
  isPM = true,
}: DailyWorkReportDetailSheetProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionInput, setRevisionInput] = useState('');
  const [revisionError, setRevisionError] = useState<string | null>(null);

  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  if (!report) return null;

  const handleVerify = () => {
    if (onVerify) {
      onVerify(report.id);
      onOpenChange(false);
    }
  };

  const handleSendRevision = () => {
    if (!revisionInput.trim() || revisionInput.trim().length < 10) {
      setRevisionError('Catatan revisi wajib diisi minimal 10 karakter.');
      return;
    }
    if (onRequestRevision) {
      onRequestRevision(report.id, revisionInput.trim());
      setShowRevisionForm(false);
      setRevisionInput('');
      setRevisionError(null);
      onOpenChange(false);
    }
  };

  const getStatusBadge = (status: DailyWorkReportStatus) => {
    switch (status) {
      case 'VERIFIED_PM':
        return <Badge variant="success">Verifikasi PM</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Menunggu PM</Badge>;
      case 'REVISION_REQUESTED':
        return <Badge variant="warning">Minta Revisi</Badge>;
      case 'DRAFT_LOG':
        return <Badge variant="outline">Draf</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
          {/* Header Status & Revision Banner */}
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Status Laporan
            </span>
            <div>{getStatusBadge(report.status)}</div>
          </div>

          {/* Revision Requested Warning Banner */}
          {report.status === 'REVISION_REQUESTED' && report.revisionNotes && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-900 dark:text-amber-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Catatan Permintaan Revisi PM:
              </div>
              <p className="pl-5 text-amber-800 dark:text-amber-200">{report.revisionNotes}</p>
            </div>
          )}

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

          {/* PM Review Actions Section */}
          {isPM && report.status === 'SUBMITTED' && (
            <div className="pt-4 border-t border-border space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Tindakan Peninjauan Project Manager
              </h4>

              {!showRevisionForm ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-xs border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                    onClick={() => setShowRevisionForm(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Minta Revisi
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleVerify}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verifikasi Laporan
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-card border border-amber-500/40 rounded-lg space-y-2 animate-in fade-in">
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-100 block">
                    Alasan / Catatan Permintaan Revisi:
                  </span>
                  <Textarea
                    placeholder="Contoh: Mohon tambahkan rincian volume cor dan foto lokasi penampungan material..."
                    value={revisionInput}
                    onChange={(e) => {
                      setRevisionInput(e.target.value);
                      if (revisionError) setRevisionError(null);
                    }}
                    maxLength={500}
                    showCharCount
                    className="text-xs min-h-[70px]"
                  />
                  {revisionError && (
                    <p className="text-[11px] text-destructive font-medium">{revisionError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setShowRevisionForm(false);
                        setRevisionError(null);
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={handleSendRevision}
                    >
                      Kirim Permintaan Revisi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
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
