import { z } from 'zod';
import { auctionStatusSchema } from '../lots/lots-catalog.schema';

export const lotStateSchema = z.object({
  lot: z.object({
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
    seller: z.object({ name: z.string() }),
  }),
  bids: z.array(
    z.object({
      amount: z.string(),
      createdAt: z.iso.datetime(),
    }),
  ),
});

export const bidPlacedSchema = z.object({
  bidId: z.uuid(),
  lotId: z.uuid(),
  amount: z.string(),
  currentPrice: z.string(),
  auctionEnd: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const auctionExtendedSchema = z.object({
  lotId: z.uuid(),
  auctionEnd: z.iso.datetime(),
});
