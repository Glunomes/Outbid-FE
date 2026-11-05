import { z } from 'zod';
import { lotResponseSchema, type LotResponse } from './lot-response.schema';

export const myLotsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export type MyLotsQueryInput = z.input<typeof myLotsQuerySchema>;

export const myLotsResponseSchema = z.object({
  lots: z.array(lotResponseSchema),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type MyLot = LotResponse;
export type MyLotsResponse = z.infer<typeof myLotsResponseSchema>;
