import { z } from 'zod';

export const packageSideEnum = z.enum(['FRONT', 'BACK', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'PDP', 'OTHER']);

export const addEvidenceSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  imageUrl: z.string().url('imageUrl must be a valid URL'),
  packageSide: packageSideEnum.default('PDP'),
  qualityScore: z.number().min(0).max(100).optional().default(90),
  mimeType: z.string().refine(val => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(val.toLowerCase()), {
    message: 'Uploaded file must be a valid supported image format (image/jpeg, image/png, image/webp)',
  }),
  fileSizeBytes: z.number().min(100, 'fileSizeBytes must be at least 100 bytes'),
});

export const queryEvidenceSchema = z.object({
  inspectionId: z.string().optional(),
  packageSide: packageSideEnum.optional(),
  minQuality: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'qualityScore', 'packageSide']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const updateEvidenceSchema = z.object({
  packageSide: packageSideEnum.optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const getB28ByIdSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});
