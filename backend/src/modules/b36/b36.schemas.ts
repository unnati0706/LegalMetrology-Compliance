import { z } from 'zod';

export const issueNoticeSchema = z.object({
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  noticeType: z.enum(['SHOW_CAUSE', 'SEIZURE_NOTICE', 'COMPOUNDING_OFFER', 'RECTIFICATION_NOTICE']).default('SHOW_CAUSE'),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  manufacturerName: z.string().min(1, 'Manufacturer Name is required'),
  issuingAuthority: z.string().min(1, 'Issuing Authority is required'),
  statutoryReference: z.string().min(1, 'Statutory Reference is required'),
  allegations: z.array(z.object({
    ruleCode: z.string().min(1),
    description: z.string().min(1),
    severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  })).min(1, 'At least one allegation is required'),
  deadlineDays: z.number().int().min(1).max(90).default(15),
  servedToEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

export const updateNoticeStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'SERVED', 'RESPONDED', 'EXPIRED', 'WITHDRAWN']),
  servedToEmail: z.string().email().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const queryNoticesSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'SERVED', 'RESPONDED', 'EXPIRED', 'WITHDRAWN']).optional(),
  noticeType: z.enum(['SHOW_CAUSE', 'SEIZURE_NOTICE', 'COMPOUNDING_OFFER', 'RECTIFICATION_NOTICE']).optional(),
  manufacturerId: z.string().optional(),
  inspectionId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const getNoticeByIdSchema = z.object({
  id: z.string().min(1, 'Notice ID is required'),
});

export type IssueNoticeInput = z.infer<typeof issueNoticeSchema>;
export type UpdateNoticeStatusInput = z.infer<typeof updateNoticeStatusSchema>;
export type QueryNoticesInput = z.infer<typeof queryNoticesSchema>;
