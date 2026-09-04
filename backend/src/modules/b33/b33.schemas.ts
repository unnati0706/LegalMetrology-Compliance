import { z } from 'zod';

export const GeoQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, 'Indian PIN code must be 6 digits').optional(),
  isHotspot: z.preprocess((val) => {
    if (val === undefined || val === '') return undefined;
    return val === 'true' || val === true;
  }, z.boolean().optional()),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});


export const RecalculateGeoMetricsSchema = z.object({
  state: z.string().min(1, 'State name is required (e.g. Maharashtra, Delhi)'),
  district: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, 'Indian PIN code must be 6 digits').optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  activeInspectorsCount: z.number().int().min(0).default(1),
});

export const UpdateGeoZoneSchema = z.object({
  isHotspot: z.boolean().optional(),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  activeInspectorsCount: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type GeoQuery = z.infer<typeof GeoQuerySchema>;
export type RecalculateGeoMetricsInput = z.infer<typeof RecalculateGeoMetricsSchema>;
export type UpdateGeoZoneInput = z.infer<typeof UpdateGeoZoneSchema>;
