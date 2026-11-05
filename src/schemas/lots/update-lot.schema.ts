import { z } from 'zod';
import { lotPriceSchema } from './create-lot.schema';
import { getAuctionScheduleIssues } from './auction-schedule';
import { lotResponseSchema, type LotResponse } from './lot-response.schema';

const localDateTimeSchema = z
  .string()
  .refine(
    (value) =>
      value === '' ||
      (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(value) &&
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
    for (const issue of getAuctionScheduleIssues(
      auctionStart,
      auctionEnd,
      'update',
    )) {
      ctx.addIssue({
        code: 'custom',
        path: [issue.path],
        message: issue.message,
      });
    }
  });

export type UpdateLotInput = z.input<typeof updateLotSchema>;
export type UpdateLotRequest = z.output<typeof updateLotSchema>;

export const updateLotResponseSchema = lotResponseSchema;

export type UpdateLotResponse = LotResponse;
