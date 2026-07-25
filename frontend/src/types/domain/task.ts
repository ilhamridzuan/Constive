export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskItem {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progressPercent: number; // 0 to 100
  parentId?: string | null;
  predecessorId?: string | null;
  displayOrder?: number;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTaskGanttDto {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  progressPercent?: number;
  parentId?: string | null;
  predecessorId?: string | null;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate: string;
  endDate: string;
  progressPercent?: number;
  parentId?: string | null;
  predecessorId?: string | null;
}
