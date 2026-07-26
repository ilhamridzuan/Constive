import { CreateTaskDto, TaskItem, UpdateTaskGanttDto } from '@/types/domain/task';

// Initial construction project WBS sample data with multi-level (level 0, 1, 2)
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
      level: 0,
      wbsCode: '1.0',
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
      level: 0,
      wbsCode: '2.0',
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
      level: 1,
      wbsCode: '2.1',
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
      level: 1,
      wbsCode: '2.2',
      displayOrder: 4,
    },
    {
      id: 'task-4-1',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pembesian & Bekisting Pile Cap',
      description: 'Perakitan besi beton dan bekisting kayu pile cap.',
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: '2026-07-15',
      endDate: '2026-07-18',
      progressPercent: 100,
      parentId: 'task-4',
      predecessorId: null,
      level: 2,
      wbsCode: '2.2.1',
      displayOrder: 5,
    },
    {
      id: 'task-4-2',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      name: 'Pengecoran Beton Ready-Mix Sloof',
      description: 'Pengecoran mutu beton K-300 sloof dan curing.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: '2026-07-19',
      endDate: '2026-07-22',
      progressPercent: 25,
      parentId: 'task-4',
      predecessorId: 'task-4-1',
      level: 2,
      wbsCode: '2.2.2',
      displayOrder: 6,
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
      level: 0,
      wbsCode: '3.0',
      displayOrder: 7,
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
      level: 1,
      wbsCode: '3.1',
      displayOrder: 8,
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
      level: 1,
      wbsCode: '3.2',
      displayOrder: 9,
    },
  ],
};

const taskStore: Map<string, TaskItem[]> = new Map();

function getProjectKey(workspaceId: string, projectId: string): string {
  return `${workspaceId}:${projectId}`;
}

export function enrichTasksWithWbs(rawTasks: Partial<TaskItem>[]): TaskItem[] {
  const rootTasks: Partial<TaskItem>[] = [];
  const childrenMap = new Map<string, Partial<TaskItem>[]>();

  rawTasks.forEach((t) => {
    if (!t.parentId || !rawTasks.some((p) => p.id === t.parentId)) {
      rootTasks.push(t);
    } else {
      const list = childrenMap.get(t.parentId) || [];
      list.push(t);
      childrenMap.set(t.parentId, list);
    }
  });

  const result: TaskItem[] = [];

  function processTask(
    t: Partial<TaskItem>,
    level: number,
    wbsCode: string,
    order: number
  ) {
    const children = childrenMap.get(t.id || '') || [];

    const fullTask: TaskItem = {
      id: t.id || `task-${Date.now()}`,
      workspaceId: t.workspaceId || '',
      projectId: t.projectId || '',
      name: t.name || 'Tugas Baru',
      description: t.description || '',
      status: t.status || 'TODO',
      priority: t.priority || 'MEDIUM',
      startDate: t.startDate || new Date().toISOString().split('T')[0],
      endDate: t.endDate || new Date().toISOString().split('T')[0],
      progressPercent: t.progressPercent ?? 0,
      parentId: t.parentId || null,
      predecessorId: t.predecessorId || null,
      level: t.level ?? level,
      wbsCode: t.wbsCode || wbsCode,
      displayOrder: order,
      createdById: t.createdById,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };

    result.push(fullTask);

    children.forEach((child, childIdx) => {
      let childWbs = child.wbsCode;
      if (!childWbs) {
        if (level === 0) {
          childWbs = `${wbsCode.split('.')[0]}.${childIdx + 1}`;
        } else {
          childWbs = `${wbsCode}.${childIdx + 1}`;
        }
      }
      processTask(child, level + 1, childWbs, order + childIdx + 1);
    });
  }

  rootTasks.forEach((root, rootIdx) => {
    const rootWbs = root.wbsCode || `${rootIdx + 1}.0`;
    processTask(root, 0, rootWbs, (rootIdx + 1) * 10);
  });

  return result;
}

export const ganttService = {
  async getTasks(workspaceId: string, projectId: string): Promise<TaskItem[]> {
    const key = getProjectKey(workspaceId, projectId);
    if (!taskStore.has(key)) {
      const enriched = enrichTasksWithWbs(
        initialMockTasks.default.map((t) => ({ ...t, workspaceId, projectId }))
      );
      taskStore.set(key, enriched);
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
      level: dto.level ?? tasks[index].level,
      wbsCode: dto.wbsCode ?? tasks[index].wbsCode,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    const enriched = enrichTasksWithWbs(tasks);
    taskStore.set(key, enriched);

    const resultTask = enriched.find((t) => t.id === taskId) || updatedTask;
    return JSON.parse(JSON.stringify(resultTask));
  },

  async createTask(
    workspaceId: string,
    projectId: string,
    dto: CreateTaskDto
  ): Promise<TaskItem> {
    const key = getProjectKey(workspaceId, projectId);
    const tasks = taskStore.get(key) || [];
    const newTask: Partial<TaskItem> = {
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
      level: dto.level,
      wbsCode: dto.wbsCode,
      displayOrder: tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask as TaskItem);
    const enriched = enrichTasksWithWbs(tasks);
    taskStore.set(key, enriched);

    const created = enriched.find((t) => t.id === newTask.id) || (newTask as TaskItem);
    return JSON.parse(JSON.stringify(created));
  },

  async deleteTask(workspaceId: string, projectId: string, taskId: string): Promise<boolean> {
    const key = getProjectKey(workspaceId, projectId);
    const tasks = taskStore.get(key) || [];
    const filtered = tasks.filter((t) => t.id !== taskId);
    const enriched = enrichTasksWithWbs(filtered);
    taskStore.set(key, enriched);
    return true;
  },
};
