import { z } from 'zod';

export const generateReportSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  format: z.enum(['PDF', 'JSON', 'CSV']).default('PDF'),
  notes: z.string().optional(),
});

export const queryReportsSchema = z.object({
  inspectionId: z.string().optional(),
  format: z.enum(['PDF', 'JSON', 'CSV']).optional(),
  status: z.enum(['GENERATED', 'AMENDED', 'ARCHIVED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'reportVersion']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateReportSchema = z.object({
  status: z.enum(['GENERATED', 'AMENDED', 'ARCHIVED']).optional(),
  notes: z.string().optional(),
});

export const getB29ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
