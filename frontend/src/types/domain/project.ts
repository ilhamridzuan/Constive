export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  progressPercent?: number;
  taskCount?: number;
  dailyLogCount?: number;
}

export interface CreateProjectInput {
  name: string;
  location?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  location?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilterInput {
  search?: string;
  status?: ProjectStatus | 'ALL';
}
