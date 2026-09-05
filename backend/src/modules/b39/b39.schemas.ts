import { z } from 'zod';

export const createSelfCertificationSchema = z.object({
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  manufacturerName: z.string().min(1, 'Manufacturer Name is required'),
  productName: z.string().min(1, 'Product Name is required'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  artworkImageUrl: z.string().url('Must be a valid artwork image URL'),
  declarationsDeclared: z.record(z.string()).refine(
    (val) => Object.keys(val).length > 0,
    { message: 'At least one declaration must be provided' }
  ),
  validityDays: z.number().int().min(30).max(730).default(365),
});

export const updateCertificationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'VERIFIED_COMPLIANT', 'NON_COMPLIANT_FLAGGED', 'EXPIRED', 'REVOKED']),
  reason: z.string().optional(),
});

export const queryCertificationsSchema = z.object({
  status: z.enum(['DRAFT', 'VERIFIED_COMPLIANT', 'NON_COMPLIANT_FLAGGED', 'EXPIRED', 'REVOKED']).optional(),
  manufacturerId: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const getCertificationByIdSchema = z.object({
  id: z.string().min(1, 'Certificate ID is required'),
});

export type CreateSelfCertificationInput = z.infer<typeof createSelfCertificationSchema>;
export type UpdateCertificationStatusInput = z.infer<typeof updateCertificationStatusSchema>;
export type QueryCertificationsInput = z.infer<typeof queryCertificationsSchema>;
