import { z } from 'zod';
import { boundingBoxSchema } from '../b21/b21.schemas.js';

export const validateDatePlacementSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  ruleVersion: z.string().default('PCR-2011-v2.0'),
  inspectionDate: z.string().optional(), // ISO date string, defaults to now
  dateDeclaration: z.object({
    rawText: z.string().min(1, 'date rawText is required'),
    month: z.number().min(1).max(12).optional(),
    year: z.number().min(2000).max(2100).optional(),
    confidence: z.number().min(0).max(1).default(0.9),
    evidenceId: z.string().optional(),
    boundingBox: boundingBoxSchema.optional(),
  }),
  packageDetails: z.object({
    netQuantityGramsOrMl: z.number().min(0).default(500),
    packageSide: z.enum(['FRONT', 'BACK', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'PDP', 'OTHER']).default('PDP'),
    measuredFontHeightMm: z.number().optional(),
    contrastRatio: z.number().optional(),
    isLegible: z.boolean().optional(),
    evidenceId: z.string().optional(),
    boundingBox: boundingBoxSchema.optional(),
  }),
});

export const queryB24Schema = z.object({
  inspectionId: z.string().optional(),
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'confidence', 'status']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateB24Schema = z.object({
  status: z.enum(['PASS', 'FLAG', 'MANUAL_REVIEW']),
  overrideReason: z.string().min(3, 'Override reason must be at least 3 characters'),
  notes: z.string().optional(),
});

export const getB24ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
