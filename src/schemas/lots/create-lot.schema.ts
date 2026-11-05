import { z } from 'zod';
import { auctionStatusSchema } from './lots-catalog.schema';

const MAX_AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

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
    const hasAuctionStart = auctionStart !== undefined;
    const hasAuctionEnd = auctionEnd !== undefined;

    if (hasAuctionStart !== hasAuctionEnd) {
      ctx.addIssue({
        code: 'custom',
        path: [hasAuctionStart ? 'auctionEnd' : 'auctionStart'],
        message: hasAuctionStart
          ? 'Auction end time is required when start time is set.'
          : 'Auction start time is required when end time is set.',
      });
    }

    if (auctionStart && new Date(auctionStart).getTime() < Date.now()) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionStart'],
        message: 'Auction start time cannot be in the past.',
      });
    }

    if (!auctionStart || !auctionEnd) {
      return;
    }

    const auctionDurationMs =
      new Date(auctionEnd).getTime() - new Date(auctionStart).getTime();

    if (auctionDurationMs <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionEnd'],
        message: 'Auction end time must be after the start time.',
      });
    } else if (auctionDurationMs > MAX_AUCTION_DURATION_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionEnd'],
        message: 'Auction duration cannot exceed 7 days.',
      });
    }
  });

export type CreateLotInput = z.infer<typeof createLotSchema>;

export const createLotResponseSchema = z.object({
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

export type CreateLotResponse = z.infer<typeof createLotResponseSchema>;
