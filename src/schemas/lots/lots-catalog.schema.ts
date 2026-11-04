import { z } from 'zod';

export const auctionStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'ENDED',
  'CANCELLED',
]);

export type AuctionStatus = z.infer<typeof auctionStatusSchema>;

export const lotsCatalogQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    name: z.string().trim().min(1).optional(),
    status: auctionStatusSchema.optional(),
    auctionStartFrom: z.iso.datetime({ offset: true }).optional(),
    auctionStartTo: z.iso.datetime({ offset: true }).optional(),
  })
  .strict()
  .superRefine(({ auctionStartFrom, auctionStartTo }, ctx) => {
    if (
      auctionStartFrom &&
      auctionStartTo &&
      new Date(auctionStartFrom) > new Date(auctionStartTo)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['auctionStartTo'],
        message: 'End of start-time range must not be before its beginning.',
      });
    }
  });

export type LotsCatalogQueryInput = z.input<typeof lotsCatalogQuerySchema>;
export type LotsCatalogQuery = z.infer<typeof lotsCatalogQuerySchema>;

export const lotCatalogItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  auctionStart: z.iso.datetime().nullable(),
  auctionEnd: z.iso.datetime().nullable(),
  status: auctionStatusSchema,
});

export type LotCatalogItem = z.infer<typeof lotCatalogItemSchema>;

export const lotsCatalogResponseSchema = z.object({
  lots: z.array(lotCatalogItemSchema),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type LotsCatalogResponse = z.infer<typeof lotsCatalogResponseSchema>;
