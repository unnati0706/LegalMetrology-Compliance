import { z } from 'zod';
import { boundingBoxSchema } from '../b21/b21.schemas.js';

export const generateViolationsInputSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  checkResultIds: z.array(z.string()).optional(),
  autoResolveFixed: z.boolean().default(false),
});

export const queryViolationsSchema = z.object({
  inspectionId: z.string().optional(),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']).optional(),
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'OVERRIDDEN', 'DISMISSED']).optional(),
  ruleCode: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateViolationSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'OVERRIDDEN', 'DISMISSED']),
  resolutionNotes: z.string().min(3, 'Resolution notes are required'),
  evidenceId: z.string().optional(),
  boundingBox: boundingBoxSchema.optional(),
});

export const getViolationByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
