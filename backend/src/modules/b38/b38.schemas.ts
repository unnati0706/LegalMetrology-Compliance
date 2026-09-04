import { z } from 'zod';

export const assessPenaltySchema = z.object({
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  noticeId: z.string().optional(),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  manufacturerName: z.string().min(1, 'Manufacturer Name is required'),
  offenseType: z.enum(['FIRST_OFFENSE', 'SECOND_OFFENSE', 'SUBSEQUENT_OFFENSE']).default('FIRST_OFFENSE'),
  sectionsViolated: z.array(z.string()).min(1, 'At least one violated section is required'),
  compoundingApplicable: z.boolean().default(true),
  customBaseAmount: z.number().positive().optional(),
});

export const updatePenaltyPaymentSchema = z.object({
  status: z.enum(['ASSESSED', 'PAID', 'WAIVED', 'ESCALATED_TO_COURT', 'DISPUTED']),
  paymentReference: z.string().optional(),
  receiptNumber: z.string().optional(),
  courtCaseReference: z.string().optional(),
  notes: z.string().optional(),
});

export const queryPenaltiesSchema = z.object({
  status: z.enum(['ASSESSED', 'PAID', 'WAIVED', 'ESCALATED_TO_COURT', 'DISPUTED']).optional(),
  manufacturerId: z.string().optional(),
  inspectionId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const getPenaltyByIdSchema = z.object({
  id: z.string().min(1, 'Penalty ID is required'),
});

export type AssessPenaltyInput = z.infer<typeof assessPenaltySchema>;
export type UpdatePenaltyPaymentInput = z.infer<typeof updatePenaltyPaymentSchema>;
export type QueryPenaltiesInput = z.infer<typeof queryPenaltiesSchema>;
