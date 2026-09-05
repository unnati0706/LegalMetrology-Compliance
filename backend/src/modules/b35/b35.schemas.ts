import { z } from 'zod';

export const QueueQuerySchema = z.object({
  status: z.enum(['QUEUED', 'ASSIGNED', 'INSPECTED', 'DEFERRED', 'CANCELLED']).optional(),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedInspectorId: z.string().optional(),
  region: z.string().optional(),
  minPriority: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const RefreshQueueSchema = z.object({
  region: z.string().optional(),
  minRiskScoreThreshold: z.number().min(0).max(100).default(50.0),
  limitItems: z.number().int().min(1).max(50).default(10),
});

export const UpdateQueueItemSchema = z.object({
  status: z.enum(['QUEUED', 'ASSIGNED', 'INSPECTED', 'DEFERRED', 'CANCELLED']).optional(),
  assignedInspectorId: z.string().optional(),
  assignedInspectorName: z.string().optional(),
  deferredReason: z.string().max(500).optional(),
  priorityScore: z.number().min(0).max(100).optional(),
});

export type QueueQuery = z.infer<typeof QueueQuerySchema>;
export type RefreshQueueInput = z.infer<typeof RefreshQueueSchema>;
export type UpdateQueueItemInput = z.infer<typeof UpdateQueueItemSchema>;
