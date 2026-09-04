import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  manufacturerId: z.string().optional(),
  periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GenerateSnapshotSchema = z.object({
  periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
  periodKey: z.string().min(1, 'Period key is required (e.g. 2026-09)'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  manufacturerId: z.string().optional(),
});

export const UpdateSnapshotSchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  notes: z.string().max(500).optional(),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type GenerateSnapshotInput = z.infer<typeof GenerateSnapshotSchema>;
export type UpdateSnapshotInput = z.infer<typeof UpdateSnapshotSchema>;
