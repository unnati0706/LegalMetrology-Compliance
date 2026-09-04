import { z } from 'zod';

export const queryManualReviewSchema = z.object({
  inspectionId: z.string().optional(),
  ruleCategory: z.string().optional(),
  status: z.enum(['MANUAL_REVIEW', 'PASS', 'FLAG']).default('MANUAL_REVIEW'),
  minConfidence: z.coerce.number().min(0).max(1).optional(),
  maxConfidence: z.coerce.number().min(0).max(1).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'confidence']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const manualReviewResolutionSchema = z.object({
  resolution: z.enum(['CONFIRM_PASS', 'CONFIRM_FLAG', 'DISMISS']),
  overrideReason: z.string().min(5, 'Override reason must be at least 5 characters with specific justification'),
  notes: z.string().optional(),
  correctedValue: z.string().optional(),
});

export const batchManualReviewSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  assignedTo: z.string().optional(),
  checkResultIds: z.array(z.string()).min(1, 'At least one checkResultId must be provided'),
  notes: z.string().optional(),
});

export const getB26ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
