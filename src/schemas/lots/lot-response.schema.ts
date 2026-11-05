import { z } from 'zod';
import { auctionStatusSchema } from './lots-catalog.schema';

export const lotResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  startingPrice: z.string(),
  currentPrice: z.string().nullable(),
  auctionStart: z.iso.datetime().nullable(),
  auctionEnd: z.iso.datetime().nullable(),
  status: auctionStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type LotResponse = z.infer<typeof lotResponseSchema>;
