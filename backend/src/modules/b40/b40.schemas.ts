import { z } from 'zod';

export const compileDossierSchema = z.object({
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  targetAgency: z.enum(['FSSAI', 'CCPA', 'NCH_GRIEVANCE', 'DISTRICT_COURT', 'STATE_CONTROLLER']),
  caseTitle: z.string().min(5, 'Case title must be at least 5 characters'),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  manufacturerName: z.string().min(1, 'Manufacturer Name is required'),
  statutoryOffenses: z.array(z.string()).min(1, 'At least one statutory offense is required'),
  noticeIds: z.array(z.string()).default([]),
  penaltyId: z.string().optional(),
});

export const transmitDossierSchema = z.object({
  externalAcknowledgmentRef: z.string().optional(),
  notes: z.string().optional(),
});

export const queryDossiersSchema = z.object({
  targetAgency: z.enum(['FSSAI', 'CCPA', 'NCH_GRIEVANCE', 'DISTRICT_COURT', 'STATE_CONTROLLER']).optional(),
  status: z.enum(['GENERATED', 'TRANSMITTED', 'ACKNOWLEDGED', 'ADMITTED_IN_COURT', 'ARCHIVED']).optional(),
  inspectionId: z.string().optional(),
  manufacturerId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const getDossierByIdSchema = z.object({
  id: z.string().min(1, 'Dossier ID is required'),
});

export type CompileDossierInput = z.infer<typeof compileDossierSchema>;
export type TransmitDossierInput = z.infer<typeof transmitDossierSchema>;
export type QueryDossiersInput = z.infer<typeof queryDossiersSchema>;
