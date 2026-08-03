import { z } from 'zod';

const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED'] as const);

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(1, 'Task name is required').max(200, 'Task name is too long'),
  description: z.string().optional(),
  status: taskStatusSchema.optional().default('TODO'),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
  progressPercent: z.number().min(0).max(100).optional().default(0),
  parentId: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    return new Date(data.startDate) <= new Date(data.endDate);
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const updateTaskGanttSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  parentId: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const batchReorderTasksSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  projectId: z.string().uuid('Invalid project ID'),
  tasks: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number(),
    parentId: z.string().uuid().nullable().optional(),
    level: z.number().min(0),
    wbsCode: z.string().optional(),
  })).min(1, 'At least one task is required'),
});

const dependencyTypeSchema = z.enum(['FS', 'SS', 'FF', 'SF'] as const);

export const taskDependencySchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  projectId: z.string().uuid('Invalid project ID'),
  taskId: z.string().uuid('Invalid task ID'),
  dependsOnTaskId: z.string().uuid('Invalid depended task ID'),
  dependencyType: dependencyTypeSchema.default('FS'),
}).refine(
  (data) => data.taskId !== data.dependsOnTaskId,
  {
    message: 'Task cannot depend on itself',
    path: ['dependsOnTaskId'],
  }
);
