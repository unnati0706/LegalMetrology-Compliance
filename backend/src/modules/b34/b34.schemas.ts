import { z } from 'zod';

export const RiskProfileQuerySchema = z.object({
  entityId: z.string().optional(),
  entityType: z.enum(['MANUFACTURER', 'PRODUCT', 'CATEGORY']).optional(),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ComputeRiskProfileSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  entityType: z.enum(['MANUFACTURER', 'PRODUCT', 'CATEGORY']),
  entityName: z.string().min(1, 'entityName is required'),
  lookbackDays: z.coerce.number().int().min(1).max(365).default(90),
});

export const OverrideRiskProfileSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  overrideReason: z.string().min(10, 'A detailed override reason of at least 10 characters is required for audit'),
});

export type RiskProfileQuery = z.infer<typeof RiskProfileQuerySchema>;
export type ComputeRiskProfileInput = z.infer<typeof ComputeRiskProfileSchema>;
export type OverrideRiskProfileInput = z.infer<typeof OverrideRiskProfileSchema>;
