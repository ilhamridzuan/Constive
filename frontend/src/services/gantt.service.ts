import { CreateTaskDto, TaskItem, UpdateTaskGanttDto } from '@/types/domain/task';

// Initial construction project WBS sample data
const initialMockTasks: Record<string, TaskItem[]> = {
  default: [
    {
      id: 'task-1',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pekerjaan Persiapan & Mobilisasi',
      description: 'Pembersihan lahan, pengukuran, dan penyediaan fasilitas sementara.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      startDate: '2026-07-01',
      endDate: '2026-07-07',
      progressPercent: 100,
      parentId: null,
      predecessorId: null,
      displayOrder: 1,
    },
    {
      id: 'task-2',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pekerjaan Substruktur (Pondasi)',
      description: 'Galian tanah, tiang pancang, dan pengecoran footplat.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: '2026-07-08',
      endDate: '2026-07-22',
      progressPercent: 75,
      parentId: null,
      predecessorId: 'task-1',
      displayOrder: 2,
    },
    {
      id: 'task-3',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pemancangan Tiang Pancang',
      description: 'Pemancangan 30 titik tiang pancang beton.',
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: '2026-07-08',
      endDate: '2026-07-14',
      progressPercent: 100,
      parentId: 'task-2',
      predecessorId: 'task-1',
      displayOrder: 3,
    },
    {
      id: 'task-4',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pengecoran Pile Cap & Sloof',
      description: 'Pembesian dan pengecoran sloof struktur bawah.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: '2026-07-15',
      endDate: '2026-07-22',
      progressPercent: 50,
      parentId: 'task-2',
      predecessorId: 'task-3',
      displayOrder: 4,
    },
    {
      id: 'task-5',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pekerjaan Struktur Utama Lantai 1',
      description: 'Kolom, balok, dan plat lantai 1.',
      status: 'TODO',
      priority: 'HIGH',
      startDate: '2026-07-23',
      endDate: '2026-08-10',
      progressPercent: 0,
      parentId: null,
      predecessorId: 'task-2',
      displayOrder: 5,
    },
    {
      id: 'task-6',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pembesian Kolom & Bekisting',
      description: 'Perakitan tulangan baja dan pemasangan bekisting.',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: '2026-07-23',
      endDate: '2026-07-30',
      progressPercent: 0,
      parentId: 'task-5',
      predecessorId: 'task-4',
      displayOrder: 6,
    },
    {
      id: 'task-7',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pengecoran Balok & Plat Lantai 1',
      description: 'Pengecoran ready-mix mutu K-300.',
      status: 'TODO',
      priority: 'URGENT',
      startDate: '2026-07-31',
      endDate: '2026-08-10',
      progressPercent: 0,
      parentId: 'task-5',
      predecessorId: 'task-6',
      displayOrder: 7,
    },
  ],
};

const taskStore: Map<string, TaskItem[]> = new Map();

function getProjectKey(workspaceId: string, projectId: string): string {
  return `${workspaceId}:${projectId}`;
}

export const ganttService = {
  async getTasks(workspaceId: string, projectId: string): Promise<TaskItem[]> {
    const key = getProjectKey(workspaceId, projectId);
    if (!taskStore.has(key)) {
      taskStore.set(
        key,
        initialMockTasks.default.map((t) => ({ ...t, workspaceId, projectId }))
      );
    }
    return JSON.parse(JSON.stringify(taskStore.get(key) || []));
  },

  async updateTaskGantt(
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskGanttDto
  ): Promise<TaskItem> {
    const key = getProjectKey(workspaceId, projectId);
    const tasks = taskStore.get(key) || [];
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const updatedTask: TaskItem = {
      ...tasks[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    taskStore.set(key, tasks);
    return JSON.parse(JSON.stringify(updatedTask));
  },

  async createTask(
    workspaceId: string,
    projectId: string,
    dto: CreateTaskDto
  ): Promise<TaskItem> {
    const key = getProjectKey(workspaceId, projectId);
    const tasks = taskStore.get(key) || [];
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      workspaceId,
      projectId,
      name: dto.name,
      description: dto.description || '',
      status: dto.status || 'TODO',
      priority: dto.priority || 'MEDIUM',
      startDate: dto.startDate,
      endDate: dto.endDate,
      progressPercent: dto.progressPercent || 0,
      parentId: dto.parentId || null,
      predecessorId: dto.predecessorId || null,
      displayOrder: tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    taskStore.set(key, tasks);
    return JSON.parse(JSON.stringify(newTask));
  },

  async deleteTask(workspaceId: string, projectId: string, taskId: string): Promise<boolean> {
    const key = getProjectKey(workspaceId, projectId);
    const tasks = taskStore.get(key) || [];
    const filtered = tasks.filter((t) => t.id !== taskId);
    taskStore.set(key, filtered);
    return true;
  },
};
