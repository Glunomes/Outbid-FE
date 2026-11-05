import { z } from 'zod';
import { getAuctionScheduleIssues } from './auction-schedule';

export const lotPriceSchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
    'Enter a valid price with up to 2 decimal places',
  )
  .refine((value) => Number(value) >= 0, 'Price cannot be negative');

const auctionDateSchema = z.iso.datetime({ offset: true });

export const createLotSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().optional(),
    startingPrice: lotPriceSchema,
    auctionStart: auctionDateSchema.optional(),
    auctionEnd: auctionDateSchema.optional(),
  })
  .superRefine(({ auctionStart, auctionEnd }, ctx) => {
    for (const issue of getAuctionScheduleIssues(
      auctionStart,
      auctionEnd,
      'create',
    )) {
      ctx.addIssue({
        code: 'custom',
        path: [issue.path],
        message: issue.message,
      });
    }
  });

export type CreateLotInput = z.infer<typeof createLotSchema>;
