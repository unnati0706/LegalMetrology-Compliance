import { z } from 'zod';

export const PatternQuerySchema = z.object({
  entityId: z.string().optional(),
  entityType: z.enum(['MANUFACTURER', 'CATEGORY', 'PRODUCT']).optional(),
  patternType: z.enum(['CHRONIC_NON_COMPLIANT', 'CATEGORY_WIDE_DEFECT', 'SEASONAL_SURGE', 'ISOLATED_INCIDENT']).optional(),
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']).optional(),
  minOccurrences: z.coerce.number().int().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const TriggerScanSchema = z.object({
  entityType: z.enum(['MANUFACTURER', 'CATEGORY', 'PRODUCT']).optional(),
  entityId: z.string().optional(),
  lookbackDays: z.coerce.number().int().min(1).max(365).default(90),
  minOccurrencesThreshold: z.coerce.number().int().min(2).default(2),
});

export const UpdatePatternStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']),
  resolutionNotes: z.string().max(1000).optional(),
});

export type PatternQuery = z.infer<typeof PatternQuerySchema>;
export type TriggerScanInput = z.infer<typeof TriggerScanSchema>;
export type UpdatePatternStatusInput = z.infer<typeof UpdatePatternStatusSchema>;
