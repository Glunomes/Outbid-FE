import { z } from 'zod';

export const makeBidRequestSchema = z
  .object({
    amount: z
      .string()
      .regex(
        /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
        'Enter a valid amount with up to 2 decimal places.',
      )
      .refine(
        (value) => Number(value) > 0,
        'Amount must be greater than zero.',
      ),
  })
  .strict();

export type MakeBidRequest = z.infer<typeof makeBidRequestSchema>;

export const makeBidResponseSchema = z.object({
  bidId: z.uuid(),
  lotId: z.uuid(),
  amount: z.string(),
  currentPrice: z.string(),
  auctionEnd: z.iso.datetime(),
});

export type MakeBidResponse = z.infer<typeof makeBidResponseSchema>;
