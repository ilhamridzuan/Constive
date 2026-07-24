'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileText, Plus, Sun, UserCheck } from 'lucide-react';
import { use } from 'react';

export default function ProjectDailyLogsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);

  const mockLogs = [
    {
      id: 'log-1',
      date: '22 Jul 2026',
      supervisor: 'Joko Mandor',
      weather: '☀️ Cerah',
      laborCount: 12,
      status: 'SUBMITTED',
      notes: 'Pengecoran kolom lantai 1 sektor A telah selesai 100%.',
      photoCount: 3,
    },
    {
      id: 'log-2',
      date: '21 Jul 2026',
      supervisor: 'Budi Pengawas',
      weather: '☁️ Berawan',
      laborCount: 15,
      status: 'VERIFIED_PM',
      notes: 'Pemasangan bekisting dan pembesian balok utama.',
      photoCount: 4,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-500" /> Laporan Harian & Dokumentasi Lapangan
        </h2>

        <Button size="sm" className="gap-1 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" /> Buat Laporan Baru
        </Button>
      </div>

      {/* Logs Table / List */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Daftar Laporan Harian Terdaftar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Pengawas</th>
                  <th className="px-4 py-3 font-medium">Cuaca & Pekerja</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {mockLogs.map((log) => (
                  <tr key={log.id} className="h-14 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-semibold text-foreground">{log.date}</td>
                    <td className="px-4 py-2 text-muted-foreground">{log.supervisor}</td>
                    <td className="px-4 py-2">
                      <span>{log.weather}</span> · <span className="font-medium">{log.laborCount} pekerja</span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={log.status === 'VERIFIED_PM' ? 'success' : 'warning'}>
                        {log.status === 'VERIFIED_PM' ? 'Verifikasi PM' : 'Menunggu PM'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 flex items-center gap-1 text-muted-foreground">
                      <Camera className="h-3.5 w-3.5 text-primary" /> {log.photoCount} foto
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
