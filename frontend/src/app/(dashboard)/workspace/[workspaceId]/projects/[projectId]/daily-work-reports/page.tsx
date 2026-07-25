'use client';

import { DailyWorkReportCard } from '@/components/features/daily-work-report/daily-work-report-card';
import { DailyWorkReportDetailSheet } from '@/components/features/daily-work-report/daily-work-report-detail-sheet';
import { DailyWorkReportFilters } from '@/components/features/daily-work-report/daily-work-report-filters';
import { DailyWorkReportTable } from '@/components/features/daily-work-report/daily-work-report-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDailyWorkReports } from '@/hooks/use-daily-work-reports';
import {
  DailyWorkReport,
  DailyWorkReportFilter,
} from '@/types/domain/daily-work-report';
import { Camera, FileText, Plus, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

export default function ProjectDailyWorkReportsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);

  // Filter state
  const [filter, setFilter] = useState<DailyWorkReportFilter>({
    weather: 'ALL',
    searchQuery: '',
  });

  // Selected Report State for Sheet Review
  const [selectedReport, setSelectedReport] = useState<DailyWorkReport | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // TanStack Query
  const {
    data: reports = [],
    isLoading,
    refetch,
  } = useDailyWorkReports(workspaceId, projectId, filter);

  const handleOpenDetail = (report: DailyWorkReport) => {
    setSelectedReport(report);
    setIsSheetOpen(true);
  };

  // Metrics summary
  const totalReports = reports.length;
  const totalPhotos = reports.reduce((acc, r) => acc + r.media.length, 0);
  const totalLaborCount = reports.reduce((acc, r) => acc + r.laborCount, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" /> Laporan Harian & Dokumentasi Lapangan
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rekapitulasi log cuaca, jumlah tenaga kerja, dan foto bukti progres fisik harian dari lokasi proyek.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs"
            onClick={() => refetch()}
            title="Refresh Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Link
            href={`/workspace/${workspaceId}/projects/${projectId}/daily-work-reports/new`}
            className="w-full sm:w-auto"
          >
            <Button size="sm" className="w-full sm:w-auto gap-1.5 h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
              <Plus className="h-4 w-4" /> Buat Laporan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border bg-card p-3 shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Total Laporan</span>
              <span className="text-lg font-bold text-foreground">{totalReports}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card p-3 shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Foto Progres</span>
              <span className="text-lg font-bold text-foreground">{totalPhotos}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card p-3 shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Total Akumulasi Pekerja</span>
              <span className="text-lg font-bold text-foreground">{totalLaborCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <DailyWorkReportFilters filter={filter} onChange={setFilter} />

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-8 text-center border border-border rounded-lg bg-card text-xs text-muted-foreground animate-pulse">
          Memuat daftar laporan harian...
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DailyWorkReportTable
              reports={reports}
              onSelectReport={handleOpenDetail}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {reports.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-lg bg-card text-xs text-muted-foreground">
                Belum ada laporan harian yang sesuai filter.
              </div>
            ) : (
              reports.map((report) => (
                <DailyWorkReportCard
                  key={report.id}
                  report={report}
                  onClick={() => handleOpenDetail(report)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Detail Sheet */}
      <DailyWorkReportDetailSheet
        workspaceId={workspaceId}
        projectId={projectId}
        report={selectedReport}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
