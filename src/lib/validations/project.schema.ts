import { z } from 'zod';
import { ProjectStatus } from '@/types/domain/project';

const projectStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const);

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(150, 'Project name is too long'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  status: projectStatusSchema.optional().default('ACTIVE'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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

export const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(1, 'Project name is required').max(150, 'Project name is too long').optional(),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
