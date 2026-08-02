import {
  CreateCommentInput,
  CreateDailyWorkReportInput,
  DailyWorkReport,
  DailyWorkReportComment,
  DailyWorkReportFilter,
  UpdateCommentInput,
} from '@/types/domain/daily-work-report';

// Mock initial database for daily work reports (API Endpoint: /daily-work-reports)
let mockDailyWorkReports: DailyWorkReport[] = [
  {
    id: 'report-101',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-25',
    weather: 'CERAH',
    laborCount: 14,
    notes:
      'Pengecoran kolom lantai 1 sektor A telah selesai 100%. Pemasangan bekisting balok dilanjutkan untuk persiapan besok.',
    media: [
      {
        id: 'med-1',
        dailyWorkReportId: 'report-101',
        fileUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
        fileName: 'pengecoran_lantai_1.jpg',
        fileSize: 2450000,
        createdAt: '2026-07-25T08:30:00Z',
      },
      {
        id: 'med-2',
        dailyWorkReportId: 'report-101',
        fileUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        fileName: 'inspeksi_pembesian.jpg',
        fileSize: 3100000,
        createdAt: '2026-07-25T08:32:00Z',
      },
      {
        id: 'med-3',
        dailyWorkReportId: 'report-101',
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
    id: 'report-102',
    projectId: 'proj-1',
    supervisorId: 'sup-2',
    supervisorName: 'Budi Pengawas',
    supervisorAvatar: '',
    logDate: '2026-07-24',
    weather: 'BERAWAN',
    laborCount: 18,
    notes:
      'Pemasangan bekisting dan pembesian balok utama area B. Seluruh pekerja menggunakan APD lengkap.',
    media: [
      {
        id: 'med-4',
        dailyWorkReportId: 'report-102',
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
    id: 'report-103',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-23',
    weather: 'HUJAN',
    laborCount: 10,
    notes:
      'Hujan deras mulai pukul 13.00. Pekerjaan outdoor dihentikan sementara, tim dialihkan ke fabrikasi besi di area terlindung.',
    media: [
      {
        id: 'med-5',
        dailyWorkReportId: 'report-103',
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
    id: 'report-104',
    projectId: 'proj-1',
    supervisorId: 'sup-3',
    supervisorName: 'Ahmad Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-22',
    weather: 'CERAH',
    laborCount: 16,
    notes:
      'Pekerjaan galian tanah fondasi tapak sektor C. Volume galian mencapai 85 m³. Seluruh material sisa galian diangkut keluar lokasi.',
    media: [
      {
        id: 'med-6',
        dailyWorkReportId: 'report-104',
        fileUrl:
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        fileName: 'galian_tanah.jpg',
        fileSize: 3400000,
        createdAt: '2026-07-22T17:00:00Z',
      },
      {
        id: 'med-7',
        dailyWorkReportId: 'report-104',
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
    id: 'report-105',
    projectId: 'proj-1',
    supervisorId: 'sup-2',
    supervisorName: 'Budi Pengawas',
    supervisorAvatar: '',
    logDate: '2026-07-21',
    weather: 'GERIMIS',
    laborCount: 12,
    notes:
      'Pemasangan pipa instalasi air bersih dan kotor di basement. Pekerjaan berjalan lancar tanpa kendala teknis.',
    media: [
      {
        id: 'med-8',
        dailyWorkReportId: 'report-105',
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
    id: 'report-106',
    projectId: 'proj-1',
    supervisorId: 'sup-1',
    supervisorName: 'Joko Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-20',
    weather: 'CERAH',
    laborCount: 20,
    notes:
      'Pengecoran plat lantai dasar sektor B menggunakan ready mix K-350. Total pemakaian 12 truk mixer (84 m³). Slump test memenuhi spesifikasi.',
    media: [
      {
        id: 'med-9',
        dailyWorkReportId: 'report-106',
        fileUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
        fileName: 'pengecoran_plat_lantai.jpg',
        fileSize: 3100000,
        createdAt: '2026-07-20T18:00:00Z',
      },
      {
        id: 'med-10',
        dailyWorkReportId: 'report-106',
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
    id: 'report-107',
    projectId: 'proj-1',
    supervisorId: 'sup-3',
    supervisorName: 'Ahmad Mandor',
    supervisorAvatar: '',
    logDate: '2026-07-19',
    weather: 'BERAWAN',
    laborCount: 8,
    notes:
      'Pembersihan area tapak dan pembuatan pagar pengaman keliling proyek.',
    media: [
      {
        id: 'med-11',
        dailyWorkReportId: 'report-107',
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

let mockDailyWorkReportComments: DailyWorkReportComment[] = [
  {
    id: 'cmt-1',
    dailyWorkReportId: 'report-101',
    workspaceId: 'ws-1',
    userId: 'sup-2',
    userName: 'Budi Pengawas',
    content: 'Mohon pastikan pembersihan bekisting balok sebelum pengecoran besok pagi.',
    createdAt: '2026-07-25T09:15:00Z',
  },
  {
    id: 'cmt-2',
    dailyWorkReportId: 'report-101',
    workspaceId: 'ws-1',
    userId: 'sup-1',
    userName: 'Joko Mandor',
    parentCommentId: 'cmt-1',
    content: 'Siap Pak Budi, tim malam akan melakukan pembersihan area balok.',
    createdAt: '2026-07-25T09:45:00Z',
  },
  {
    id: 'cmt-3',
    dailyWorkReportId: 'report-101',
    workspaceId: 'ws-1',
    userId: 'pm-1',
    userName: 'Dewi Project Manager',
    content: 'Bagus. Foto inspeksi pembesian sudah lengkap.',
    createdAt: '2026-07-25T10:30:00Z',
  },
];


export const dailyWorkReportService = {
  // GET /daily-work-reports
  async getDailyWorkReports(
    projectId: string,
    filter?: DailyWorkReportFilter
  ): Promise<DailyWorkReport[]> {
    await new Promise((res) => setTimeout(res, 200));

    let reports = mockDailyWorkReports.filter((r) => r.projectId === projectId);

    // Fallback: If no reports match the specific projectId in mock dataset, return all mock reports for review testing
    if (reports.length === 0) {
      reports = mockDailyWorkReports;
    }

    if (filter) {
      if (filter.weather && filter.weather !== 'ALL') {
        reports = reports.filter((r) => r.weather === filter.weather);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        reports = reports.filter(
          (r) =>
            r.notes.toLowerCase().includes(query) ||
            r.supervisorName.toLowerCase().includes(query) ||
            r.logDate.includes(query)
        );
      }
    }

    return [...reports].sort(
      (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
    );
  },

  // GET /daily-work-reports/:id
  async getDailyWorkReportById(
    projectId: string,
    reportId: string
  ): Promise<DailyWorkReport> {
    await new Promise((res) => setTimeout(res, 150));
    const report = mockDailyWorkReports.find(
      (r) => r.id === reportId && (r.projectId === projectId || projectId === 'proj-1')
    );
    if (!report) {
      throw new Error('Laporan harian tidak ditemukan');
    }
    return report;
  },

  // POST /daily-work-reports
  async createDailyWorkReport(
    projectId: string,
    input: CreateDailyWorkReportInput
  ): Promise<DailyWorkReport> {
    await new Promise((res) => setTimeout(res, 400));

    const newReportId = `report-${Date.now()}`;
    const newReport: DailyWorkReport = {
      id: newReportId,
      projectId,
      supervisorId: 'sup-current',
      supervisorName: 'Pengawas Aktif',
      logDate: input.logDate,
      weather: input.weather,
      laborCount: input.laborCount,
      notes: input.notes,
      media: input.mediaUrls.map((url, idx) => ({
        id: `med-${Date.now()}-${idx}`,
        dailyWorkReportId: newReportId,
        fileUrl: url,
        fileName: `foto_progres_${idx + 1}.jpg`,
        fileSize: 2000000,
        createdAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    };

    mockDailyWorkReports.unshift(newReport);
    return newReport;
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

  // --- Comments API Methods ---

  // GET /daily-work-reports/:reportId/comments
  async getComments(projectId: string, reportId: string): Promise<DailyWorkReportComment[]> {
    await new Promise((res) => setTimeout(res, 150));
    return mockDailyWorkReportComments.filter((c) => c.dailyWorkReportId === reportId);
  },

  // POST /daily-work-reports/:reportId/comments
  async createComment(
    projectId: string,
    reportId: string,
    input: CreateCommentInput,
    currentUserId: string = 'sup-1',
    currentUserName: string = 'Joko Mandor'
  ): Promise<DailyWorkReportComment> {
    await new Promise((res) => setTimeout(res, 250));
    const newComment: DailyWorkReportComment = {
      id: `cmt-${Date.now()}`,
      dailyWorkReportId: reportId,
      workspaceId: 'ws-1',
      userId: currentUserId,
      userName: currentUserName,
      parentCommentId: input.parentCommentId,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    mockDailyWorkReportComments.push(newComment);
    return newComment;
  },

  // PATCH /daily-work-reports/:reportId/comments/:commentId
  async updateComment(
    projectId: string,
    reportId: string,
    commentId: string,
    input: UpdateCommentInput
  ): Promise<DailyWorkReportComment> {
    await new Promise((res) => setTimeout(res, 200));
    const index = mockDailyWorkReportComments.findIndex(
      (c) => c.id === commentId && c.dailyWorkReportId === reportId
    );
    if (index === -1) {
      throw new Error('Komentar tidak ditemukan');
    }
    const updated = {
      ...mockDailyWorkReportComments[index],
      content: input.content,
      updatedAt: new Date().toISOString(),
    };
    mockDailyWorkReportComments[index] = updated;
    return updated;
  },

  // DELETE /daily-work-reports/:reportId/comments/:commentId
  async deleteComment(
    projectId: string,
    reportId: string,
    commentId: string
  ): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    const idsToDelete = new Set<string>([commentId]);
    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      for (const c of mockDailyWorkReportComments) {
        if (c.parentCommentId && idsToDelete.has(c.parentCommentId) && !idsToDelete.has(c.id)) {
          idsToDelete.add(c.id);
          addedMore = true;
        }
      }
    }
    mockDailyWorkReportComments = mockDailyWorkReportComments.filter(
      (c) => !idsToDelete.has(c.id)
    );
  },
};

