import { z } from 'zod';
import { lotResponseSchema } from './lot-response.schema';

export const lotDetailsSchema = lotResponseSchema.extend({
  seller: z.object({ id: z.uuid(), name: z.string() }),
});

export type LotDetails = z.infer<typeof lotDetailsSchema>;
