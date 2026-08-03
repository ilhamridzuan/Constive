import { z } from 'zod';
import { WeatherCondition } from '@/types/domain/daily-work-report';

export const createDailyReportSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  weather: z.enum(['CERAH', 'BERAWAN', 'GERIMIS', 'HUJAN'] as const),
  laborCount: z.number().int().min(0, 'Labor count cannot be negative'),
  notes: z.string().min(1, 'Notes are required'),
  // Media files are validated in the API route directly since they come as FormData
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
  parentCommentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});
