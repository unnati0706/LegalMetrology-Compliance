import { z } from 'zod';

export const queryInspectionsSchema = z.object({
  productName: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_ANALYSIS', 'IN_REVIEW', 'MANUAL_REVIEW_REQUIRED', 'COMPLETED', 'FLAGGED']).optional(),
  inspectorId: z.string().optional(),
  manufacturerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'productName', 'status']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const createInspectionSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  brand: z.string().optional(),
  manufacturerId: z.string().optional(),
  location: z.string().optional(),
  ruleVersion: z.string().default('PCR-2011-v2.0'),
  metadata: z.record(z.any()).optional(),
});

export const updateInspectionSchema = z.object({
  productName: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_ANALYSIS', 'IN_REVIEW', 'MANUAL_REVIEW_REQUIRED', 'COMPLETED', 'FLAGGED']).optional(),
  location: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const getB27ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
