import {
  CreateProjectInput,
  Project,
  ProjectFilterInput,
  UpdateProjectInput,
} from '@/types/domain/project';

const MOCK_PROJECTS: Record<string, Project[]> = {
  'w1234567-89ab-cdef-0123-456789abcdef': [
    {
      id: 'p-101',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      name: 'Pembangunan Menara Sudirman Tower A',
      location: 'Kuningan, Jakarta Selatan',
      description: 'Konstruksi gedung bertingkat 32 lantai dengan struktur beton bertulang.',
      status: 'ACTIVE',
      startDate: '2026-01-15',
      endDate: '2026-12-30',
      createdBy: 'u-1',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-07-22T00:00:00Z',
      progressPercent: 68,
      taskCount: 45,
      dailyWorkReportCount: 120,
    },
    {
      id: 'p-102',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      name: 'Pekerjaan Jembatan Tol Cikampek II',
      location: 'Karawang, Jawa Barat',
      description: 'Pekerjaan suprastruktur jembatan layang tol sepanjang 2.4 km.',
      status: 'ACTIVE',
      startDate: '2026-03-01',
      endDate: '2026-11-15',
      createdBy: 'u-1',
      createdAt: '2026-02-20T00:00:00Z',
      updatedAt: '2026-07-20T00:00:00Z',
      progressPercent: 42,
      taskCount: 28,
      dailyWorkReportCount: 65,
    },
    {
      id: 'p-103',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      name: 'Renovasi Gedung Perkantoran BSD Smart Hub',
      location: 'Tangerang Selatan, Banten',
      description: 'Fit-out interior dan peremajaan fasad kaca tempered.',
      status: 'COMPLETED',
      startDate: '2026-02-01',
      endDate: '2026-06-30',
      createdBy: 'u-1',
      createdAt: '2026-01-25T00:00:00Z',
      updatedAt: '2026-06-30T00:00:00Z',
      progressPercent: 100,
      taskCount: 30,
      dailyWorkReportCount: 90,
    },
    {
      id: 'p-104',
      workspaceId: 'w1234567-89ab-cdef-0123-456789abcdef',
      name: 'Perencanaan Perumahan Residensial Sentul',
      location: 'Bogor, Jawa Barat',
      description: 'Tahap perencanaan land clearing dan cut & fill.',
      status: 'DRAFT',
      startDate: '2026-08-01',
      endDate: '2027-02-28',
      createdBy: 'u-1',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
      progressPercent: 0,
      taskCount: 12,
      dailyWorkReportCount: 0,
    },
  ],
};

export const projectService = {
  async getProjects(
    workspaceId: string,
    filters?: ProjectFilterInput
  ): Promise<Project[]> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/projects`);
      if (res.ok) {
        const data = await res.json();
        let list: Project[] = data.projects || data;
        if (filters?.search) {
          list = list.filter((p) =>
            p.name.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        if (filters?.status && filters.status !== 'ALL') {
          list = list.filter((p) => p.status === filters.status);
        }
        return list;
      }
    } catch {
      // API fallback
    }

    let list = MOCK_PROJECTS[workspaceId] || MOCK_PROJECTS['w1234567-89ab-cdef-0123-456789abcdef'] || [];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    return list;
  },

  async getProjectById(workspaceId: string, projectId: string): Promise<Project | null> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const list = MOCK_PROJECTS[workspaceId] || MOCK_PROJECTS['w1234567-89ab-cdef-0123-456789abcdef'] || [];
    const found = list.find((p) => p.id === projectId);
    return found || list[0] || null;
  },

  async createProject(workspaceId: string, input: CreateProjectInput): Promise<Project> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const newProj: Project = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      name: input.name,
      location: input.location || '',
      description: input.description || '',
      status: input.status || 'ACTIVE',
      startDate: input.startDate || new Date().toISOString().split('T')[0],
      endDate: input.endDate || '',
      createdBy: 'u-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressPercent: 0,
      taskCount: 0,
      dailyWorkReportCount: 0,
    };

    if (!MOCK_PROJECTS[workspaceId]) {
      MOCK_PROJECTS[workspaceId] = [];
    }
    MOCK_PROJECTS[workspaceId].unshift(newProj);
    return newProj;
  },

  async updateProject(
    workspaceId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const list = MOCK_PROJECTS[workspaceId] || MOCK_PROJECTS['w1234567-89ab-cdef-0123-456789abcdef'] || [];
    const idx = list.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return list[idx];
    }
    throw new Error('Proyek tidak ditemukan');
  },

  async deleteProject(workspaceId: string, projectId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // API fallback
    }

    if (MOCK_PROJECTS[workspaceId]) {
      MOCK_PROJECTS[workspaceId] = MOCK_PROJECTS[workspaceId].filter((p) => p.id !== projectId);
    }
    return true;
  },
};
