import { z } from 'zod';
import {
  createLotResponseSchema,
  lotPriceSchema,
  type CreateLotResponse,
} from './create-lot.schema';

const localDateTimeSchema = z
  .string()
  .refine(
    (value) =>
      value === '' ||
      (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(
        value,
      ) &&
        !Number.isNaN(new Date(value).getTime())),
    'Enter a valid date and time',
  )
  .transform((value) =>
    value && !Number.isNaN(new Date(value).getTime())
      ? new Date(value).toISOString()
      : null,
  );

export const updateLotSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().transform((value) => value.trim() || null),
    startingPrice: lotPriceSchema,
    auctionStart: localDateTimeSchema,
    auctionEnd: localDateTimeSchema,
  })
  .superRefine(({ auctionStart, auctionEnd }, ctx) => {
    if ((auctionStart === null) !== (auctionEnd === null)) {
      ctx.addIssue({
        code: 'custom',
        path: [auctionStart === null ? 'auctionEnd' : 'auctionStart'],
        message: 'Auction start and end times must both be set or both be empty.',
      });
      return;
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

    const durationMs =
      new Date(auctionEnd).getTime() - new Date(auctionStart).getTime();
    if (durationMs <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionEnd'],
        message: 'Auction end time must be after the start time.',
      });
    } else if (durationMs > 7 * 24 * 60 * 60 * 1000) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionEnd'],
        message: 'Auction duration cannot exceed 7 days.',
      });
    }
  });

export type UpdateLotInput = z.input<typeof updateLotSchema>;
export type UpdateLotRequest = z.output<typeof updateLotSchema>;

export const updateLotResponseSchema = createLotResponseSchema;

export type UpdateLotResponse = CreateLotResponse;
