import { z } from 'zod';

export const boundingBoxSchema = z.object({
  ymin: z.number().min(0).max(1),
  xmin: z.number().min(0).max(1),
  ymax: z.number().min(0).max(1),
  xmax: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1).optional(),
});

export const declarationItemSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  value: z.string().min(1, 'Field value cannot be empty'),
  rawText: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.9),
  evidenceId: z.string().optional(),
  boundingBox: boundingBoxSchema.optional(),
});

export const validateDeclarationsInputSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  isImported: z.boolean().default(false),
  ruleVersion: z.string().default('PCR-2011-v2.0'),
  declarations: z.array(declarationItemSchema).min(1, 'At least one declaration is required'),
});

export const queryCheckResultsSchema = z.object({
  inspectionId: z.string().optional(),
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']).optional(),
  ruleCategory: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'confidence', 'status']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateCheckResultSchema = z.object({
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']),
  overrideReason: z.string().min(3, 'Reason must be at least 3 characters when overriding check result'),
  notes: z.string().optional(),
});

export const getByIdParamsSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
