import {
  CreateDailyLogInput,
  DailyLog,
  DailyLogFilter,
  WeatherCondition,
} from '@/types/domain/daily-log';

// Mock initial database for daily logs
let mockDailyLogs: DailyLog[] = [
  {
    id: 'log-101',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-25',
    weather: 'CERAH',
    laborCount: 14,
    notes:
      'Pengecoran kolom lantai 1 sektor A telah selesai 100%. Pemasangan bekisting balok dilanjutkan untuk persiapan besok.',
    status: 'SUBMITTED',
    media: [
      {
        id: 'med-1',
        dailyLogId: 'log-101',
        fileUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
        fileName: 'pengecoran_lantai_1.jpg',
        fileSize: 2450000,
        createdAt: '2026-07-25T08:30:00Z',
      },
      {
        id: 'med-2',
        dailyLogId: 'log-101',
        fileUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        fileName: 'inspeksi_pembesian.jpg',
        fileSize: 3100000,
        createdAt: '2026-07-25T08:32:00Z',
      },
      {
        id: 'med-3',
        dailyLogId: 'log-101',
        fileUrl:
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        fileName: 'situasi_lapangan.jpg',
        fileSize: 1800000,
        createdAt: '2026-07-25T08:35:00Z',
      },
    ],
    createdAt: '2026-07-25T08:40:00Z',
  },
  {
    id: 'log-102',
    projectId: 'proj-1',
    supervisorId: 'sup-2',
    supervisorName: 'Budi Pengawas',
    supervisorAvatar: '',
    logDate: '2026-07-24',
    weather: 'BERAWAN',
    laborCount: 18,
    notes:
      'Pemasangan bekisting dan pembesian balok utama area B. Seluruh pekerja menggunakan APD lengkap.',
    status: 'VERIFIED_PM',
    media: [
      {
        id: 'med-4',
        dailyLogId: 'log-102',
        fileUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
        fileName: 'bekisting_balok.jpg',
        fileSize: 2900000,
        createdAt: '2026-07-24T16:10:00Z',
      },
    ],
    createdAt: '2026-07-24T16:15:00Z',
  },
  {
    id: 'log-103',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-23',
    weather: 'HUJAN',
    laborCount: 10,
    notes:
      'Hujan deras mulai pukul 13.00. Pekerjaan outdoor dihentikan sementara, tim dialihkan ke fabrikasi besi di area terlindung.',
    status: 'REVISION_REQUESTED',
    revisionNotes:
      'Mohon tambahkan rincian volume besi yang difabrikasi dan foto lokasi penyimpanan material.',
    media: [
      {
        id: 'med-5',
        dailyLogId: 'log-103',
        fileUrl:
          'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
        fileName: 'area_fabrikasi.jpg',
        fileSize: 1950000,
        createdAt: '2026-07-23T15:00:00Z',
      },
    ],
    createdAt: '2026-07-23T15:20:00Z',
  },
  {
    id: 'log-104',
    projectId: 'proj-1',
    supervisorId: 'sup-3',
    supervisorName: 'Ahmad Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-22',
    weather: 'CERAH',
    laborCount: 16,
    notes:
      'Pekerjaan galian tanah fondasi tapak sektor C. Volume galian mencapai 85 m³. Seluruh material sisa galian diangkut keluar lokasi.',
    status: 'VERIFIED_PM',
    media: [
      {
        id: 'med-6',
        dailyLogId: 'log-104',
        fileUrl:
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        fileName: 'galian_tanah.jpg',
        fileSize: 3400000,
        createdAt: '2026-07-22T17:00:00Z',
      },
      {
        id: 'med-7',
        dailyLogId: 'log-104',
        fileUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
        fileName: 'alat_berat_excavator.jpg',
        fileSize: 2800000,
        createdAt: '2026-07-22T17:05:00Z',
      },
    ],
    createdAt: '2026-07-22T17:15:00Z',
  },
  {
    id: 'log-105',
    projectId: 'proj-1',
    supervisorId: 'sup-2',
    supervisorName: 'Budi Pengawas',
    supervisorAvatar: '',
    logDate: '2026-07-21',
    weather: 'GERIMIS',
    laborCount: 12,
    notes:
      'Pemasangan pipa instalasi air bersih dan kotor di basement. Pekerjaan berjalan lancar tanpa kendala teknis.',
    status: 'SUBMITTED',
    media: [
      {
        id: 'med-8',
        dailyLogId: 'log-105',
        fileUrl:
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        fileName: 'instalasi_pipa.jpg',
        fileSize: 2200000,
        createdAt: '2026-07-21T16:30:00Z',
      },
    ],
    createdAt: '2026-07-21T16:45:00Z',
  },
  {
    id: 'log-106',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-20',
    weather: 'CERAH',
    laborCount: 20,
    notes:
      'Pengecoran plat lantai dasar sektor B menggunakan ready mix K-350. Total pemakaian 12 truk mixer (84 m³). Slump test memenuhi spesifikasi.',
    status: 'VERIFIED_PM',
    media: [
      {
        id: 'med-9',
        dailyLogId: 'log-106',
        fileUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
        fileName: 'pengecoran_plat_lantai.jpg',
        fileSize: 3100000,
        createdAt: '2026-07-20T18:00:00Z',
      },
      {
        id: 'med-10',
        dailyLogId: 'log-106',
        fileUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        fileName: 'slump_test_beton.jpg',
        fileSize: 2600000,
        createdAt: '2026-07-20T18:10:00Z',
      },
    ],
    createdAt: '2026-07-20T18:20:00Z',
  },
  {
    id: 'log-107',
    projectId: 'proj-1',
    supervisorId: 'sup-3',
    supervisorName: 'Ahmad Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-19',
    weather: 'BERAWAN',
    laborCount: 8,
    notes:
      'Pembersihan area tapak dan pembuatan pagar pengaman keliling proyek.',
    status: 'DRAFT_LOG',
    media: [
      {
        id: 'med-11',
        dailyLogId: 'log-107',
        fileUrl:
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        fileName: 'pagar_pengaman.jpg',
        fileSize: 1500000,
        createdAt: '2026-07-19T14:00:00Z',
      },
    ],
    createdAt: '2026-07-19T14:15:00Z',
  },
];

export const dailyLogService = {
  async getDailyLogs(projectId: string, filter?: DailyLogFilter): Promise<DailyLog[]> {
    await new Promise((res) => setTimeout(res, 200));

    let logs = mockDailyLogs.filter((log) => log.projectId === projectId);

    // Fallback: If no logs match the specific projectId in mock dataset, return all mock logs for review testing
    if (logs.length === 0) {
      logs = mockDailyLogs;
    }

    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        logs = logs.filter((l) => l.status === filter.status);
      }
      if (filter.weather && filter.weather !== 'ALL') {
        logs = logs.filter((l) => l.weather === filter.weather);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.notes.toLowerCase().includes(query) ||
            l.supervisorName.toLowerCase().includes(query) ||
            l.logDate.includes(query)
        );
      }
    }

    return [...logs].sort(
      (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
    );
  },

  async getDailyLogById(projectId: string, logId: string): Promise<DailyLog> {
    await new Promise((res) => setTimeout(res, 150));
    const log = mockDailyLogs.find(
      (l) => l.id === logId && (l.projectId === projectId || projectId === 'proj-1')
    );
    if (!log) {
      throw new Error('Laporan harian tidak ditemukan');
    }
    return log;
  },

  async createDailyLog(projectId: string, input: CreateDailyLogInput): Promise<DailyLog> {
    await new Promise((res) => setTimeout(res, 400));

    const newLogId = `log-${Date.now()}`;
    const newLog: DailyLog = {
      id: newLogId,
      projectId,
      supervisorId: 'sup-current',
      supervisorName: 'Pengawas Aktif',
      logDate: input.logDate,
      weather: input.weather,
      laborCount: input.laborCount,
      notes: input.notes,
      status: 'SUBMITTED',
      media: input.mediaUrls.map((url, idx) => ({
        id: `med-${Date.now()}-${idx}`,
        dailyLogId: newLogId,
        fileUrl: url,
        fileName: `foto_progres_${idx + 1}.jpg`,
        fileSize: 2000000,
        createdAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    };

    mockDailyLogs.unshift(newLog);
    return newLog;
  },

  async verifyDailyLog(projectId: string, logId: string): Promise<DailyLog> {
    await new Promise((res) => setTimeout(res, 250));
    const log = mockDailyLogs.find((l) => l.id === logId);
    if (!log) {
      throw new Error('Laporan harian tidak ditemukan');
    }
    log.status = 'VERIFIED_PM';
    log.revisionNotes = undefined;
    log.updatedAt = new Date().toISOString();
    return { ...log };
  },

  async requestRevision(
    projectId: string,
    logId: string,
    revisionNotes: string
  ): Promise<DailyLog> {
    await new Promise((res) => setTimeout(res, 250));
    const log = mockDailyLogs.find((l) => l.id === logId);
    if (!log) {
      throw new Error('Laporan harian tidak ditemukan');
    }
    log.status = 'REVISION_REQUESTED';
    log.revisionNotes = revisionNotes;
    log.updatedAt = new Date().toISOString();
    return { ...log };
  },

  async uploadPhoto(file: File): Promise<string> {
    // Validate max file size 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Ukuran foto melebihi batas 5 MB');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Format file tidak didukung. Gunakan JPG atau PNG.');
    }

    await new Promise((res) => setTimeout(res, 600));

    // Return object URL or placeholder URL
    if (typeof window !== 'undefined' && window.URL) {
      return URL.createObjectURL(file);
    }
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80';
  },
};
