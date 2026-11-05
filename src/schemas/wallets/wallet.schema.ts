import { z } from 'zod';

export const walletResponseSchema = z.object({
  availableBalance: z.string().regex(/^\d+\.\d{2}$/),
  reservedBalance: z.string().regex(/^\d+\.\d{2}$/),
});

export type WalletResponse = z.infer<typeof walletResponseSchema>;
