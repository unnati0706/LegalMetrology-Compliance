import { z } from 'zod';
import { boundingBoxSchema } from '../b21/b21.schemas.js';

export const validateMrpQuantityInputSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  ruleVersion: z.string().default('PCR-2011-v2.0'),
  mrpDeclaration: z.object({
    rawText: z.string().min(1, 'mrp rawText is required'),
    confidence: z.number().min(0).max(1).default(0.9),
    evidenceId: z.string().optional(),
    boundingBox: boundingBoxSchema.optional(),
  }),
  netQuantityDeclaration: z.object({
    rawText: z.string().min(1, 'netQuantity rawText is required'),
    confidence: z.number().min(0).max(1).default(0.9),
    evidenceId: z.string().optional(),
    boundingBox: boundingBoxSchema.optional(),
  }),
  unitSalePriceDeclaration: z.object({
    rawText: z.string().optional(),
    confidence: z.number().min(0).max(1).default(0.9),
    evidenceId: z.string().optional(),
    boundingBox: boundingBoxSchema.optional(),
  }).optional(),
});

export const queryB22Schema = z.object({
  inspectionId: z.string().optional(),
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'confidence', 'status']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateB22Schema = z.object({
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']),
  overrideReason: z.string().min(3, 'Override reason must be at least 3 characters'),
  notes: z.string().optional(),
});

export const getB22ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
