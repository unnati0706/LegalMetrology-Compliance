import { z } from 'zod';

export const queryReportVersionsSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required to query report versions'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'reportVersion']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
});

export const createAmendedReportSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  previousReportId: z.string().min(1, 'previousReportId is required to amend a report'),
  amendmentReason: z.string().min(5, 'Amendment reason must be at least 5 characters detailing the modification justification'),
  format: z.enum(['PDF', 'JSON', 'CSV']).default('PDF'),
  isMajorVersion: z.boolean().default(false),
});

export const updateReportVersionMetaSchema = z.object({
  status: z.enum(['GENERATED', 'AMENDED', 'ARCHIVED']).optional(),
  notes: z.string().optional(),
});

export const getB30ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});

export const diffReportsParamsSchema = z.object({
  id1: z.string().min(1, 'First report ID (id1) is required'),
  id2: z.string().min(1, 'Second report ID (id2) is required'),
});
