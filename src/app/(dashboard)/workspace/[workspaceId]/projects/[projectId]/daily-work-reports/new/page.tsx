'use client';

import {
  PhotoPreviewItem,
  PhotoUploader,
} from '@/components/features/daily-work-report/photo-uploader';
import { WeatherSelector } from '@/components/features/daily-work-report/weather-selector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDailyWorkReport } from '@/hooks/use-daily-work-reports';
import { useDailyWorkReportDraft } from '@/hooks/use-daily-work-report-draft';
import { WeatherCondition } from '@/types/domain/daily-work-report';
import { ArrowLeft, Check, CheckCircle2, FileText, Minus, Plus, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function NewDailyWorkReportPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);
  const router = useRouter();

  // Today's Date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [logDate, setLogDate] = useState<string>(todayStr);
  const [weather, setWeather] = useState<WeatherCondition>('CERAH');
  const [laborCount, setLaborCount] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoPreviewItem[]>([]);
  const [draftAlertShown, setDraftAlertShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Draft persistence hook
  const { loadDraft, saveDraft, clearDraft, lastSaved } = useDailyWorkReportDraft(
    projectId,
    logDate
  );

  const createReportMutation = useCreateDailyWorkReport(workspaceId, projectId);

  // Hydrate draft on mount
  useEffect(() => {
    const existingDraft = loadDraft();
    if (existingDraft) {
      if (existingDraft.weather) setWeather(existingDraft.weather);
      if (typeof existingDraft.laborCount === 'number') setLaborCount(existingDraft.laborCount);
      if (existingDraft.notes) setNotes(existingDraft.notes);
      setDraftAlertShown(true);
    }
  }, [loadDraft]);

  // Auto-save draft on input change (debounced 1s)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft({
        logDate,
        weather,
        laborCount,
        notes,
        photoUrls: photos.map((p) => p.url),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [logDate, weather, laborCount, notes, photos, saveDraft]);

  const handleLaborIncrement = () => setLaborCount((prev) => prev + 1);
  const handleLaborDecrement = () => setLaborCount((prev) => Math.max(0, prev - 1));

  const isFormValid = weather && laborCount >= 0 && photos.length > 0 && notes.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (photos.length === 0) {
      setSubmitError('Wajib menyertakan minimal 1 foto dokumentasi progres fisik.');
      return;
    }

    if (!notes.trim()) {
      setSubmitError('Catatan pekerjaan harian wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReportMutation.mutateAsync({
        logDate,
        weather,
        laborCount,
        notes: notes.trim(),
        mediaFiles: photos.map((p) => p.file as File).filter(Boolean),
      });
      clearDraft();
      router.push(`/workspace/${workspaceId}/projects/${projectId}/daily-work-reports`);
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal mengirim laporan harian. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto space-y-4 pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href={`/workspace/${workspaceId}/projects/${projectId}/daily-work-reports`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Laporan
        </Link>

        {lastSaved && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500" /> Draf tersimpan otomatis
          </span>
        )}
      </div>

      {/* Main Title Card */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" /> Form Laporan Harian Pintar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Input kondisi cuaca, jumlah tenaga kerja, dan foto progres lapangan.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] px-2 py-0.5">
          Mandor / Supervisor
        </Badge>
      </div>

      {/* Draft Loaded Alert Banner */}
      {draftAlertShown && (
        <Alert variant="info" className="animate-in fade-in">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-xs font-semibold">Draf Laporan Ditemukan</AlertTitle>
          <AlertDescription className="text-xs">
            Data laporan lokal sebelumnya telah dimuat secara otomatis agar Anda tidak kehilangan pekerjaan.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Error Banner */}
      {submitError && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertTitle className="text-xs font-semibold font-sans">Gagal Pengiriman</AlertTitle>
          <AlertDescription className="text-xs">{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Tanggal & Proyek */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
              1. Tanggal & Konteks Proyek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block">Tanggal Laporan</label>
              <Input
                type="date"
                value={logDate}
                max={todayStr}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-10 text-xs font-medium"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Kondisi Cuaca */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
              2. Kondisi Cuaca Dominan Lapangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherSelector value={weather} onChange={setWeather} disabled={isSubmitting} />
          </CardContent>
        </Card>

        {/* Section 3: Jumlah Tenaga Kerja */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
              3. Jumlah Tenaga Kerja Hadir (Orang)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 p-2 bg-muted/30 border border-border rounded-lg max-w-sm mx-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLaborDecrement}
                disabled={laborCount <= 0 || isSubmitting}
                className="h-11 w-11 rounded-md shrink-0 border-border"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-foreground block">{laborCount}</span>
                <span className="text-[11px] text-muted-foreground block">Pekerja Lapangan</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLaborIncrement}
                disabled={isSubmitting}
                className="h-11 w-11 rounded-md shrink-0 border-border"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Catatan Pekerjaan & Kendala */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
              4. Catatan Pekerjaan & Kendala Lapangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Jelaskan uraian pekerjaan fisik yang diselesaikan hari ini, kendala cuaca/material/tenaga kerja, atau instruksi tindak lanjut..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              showCharCount
              className="min-h-[120px] text-xs leading-relaxed"
              required
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Section 5: Foto Progres Fisik */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
              5. Foto Bukti Progres Fisik Lapangan (Wajib min 1 foto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader photos={photos} onPhotosChange={setPhotos} disabled={isSubmitting} />
          </CardContent>
        </Card>

        {/* Section 6: Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              saveDraft({ logDate, weather, laborCount, notes, photoUrls: photos.map((p) => p.url) });
              router.push(`/workspace/${workspaceId}/projects/${projectId}/daily-work-reports`);
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex-1 h-12 text-xs font-semibold border-border"
          >
            <Save className="h-4 w-4 mr-1.5" /> Simpan Draf & Keluar
          </Button>

          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full sm:w-auto flex-1 h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Mengirim Laporan...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Kirim Laporan Harian
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
