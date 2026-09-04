import { z } from 'zod';

export const submitAppealSchema = z.object({
  noticeId: z.string().min(1, 'Notice ID is required'),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  appellantName: z.string().min(1, 'Appellant Name is required'),
  groundsForAppeal: z.string().min(10, 'Grounds for appeal must be at least 10 characters'),
  correctiveActionPlan: z.string().min(10, 'Corrective action plan must be at least 10 characters'),
  rectificationEvidence: z.array(z.object({
    evidenceType: z.enum(['REVISED_ARTWORK', 'CORRECTION_STICKER_PROOF', 'BATCH_RECALL_NOTICE', 'LAB_REPORT']),
    documentUrl: z.string().url('Must be a valid document URL'),
    description: z.string().min(1),
  })).default([]),
});

export const reviewAppealSchema = z.object({
  decision: z.enum(['ACCEPT', 'REJECT', 'REQUEST_MORE_INFO', 'MITIGATE']),
  decisionNotes: z.string().min(5, 'Decision notes are required'),
  penaltyMitigationPercent: z.number().min(0).max(100).optional(),
});

export const queryAppealsSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'ADDITIONAL_INFO_REQUESTED', 'MITIGATED']).optional(),
  noticeId: z.string().optional(),
  manufacturerId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const getAppealByIdSchema = z.object({
  id: z.string().min(1, 'Appeal ID is required'),
});

export type SubmitAppealInput = z.infer<typeof submitAppealSchema>;
export type ReviewAppealInput = z.infer<typeof reviewAppealSchema>;
export type QueryAppealsInput = z.infer<typeof queryAppealsSchema>;
