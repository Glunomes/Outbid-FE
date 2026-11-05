import { z } from 'zod';

export const walletResponseSchema = z.object({
  availableBalance: z.string().regex(/^\d+\.\d{2}$/),
  reservedBalance: z.string().regex(/^\d+\.\d{2}$/),
});

export type WalletResponse = z.infer<typeof walletResponseSchema>;

export const walletDepositSchema = z.object({
  amount: z
    .string()
    .regex(
      /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
      'Enter an amount with up to 2 decimal places.',
    )
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero.'),
});

export type WalletDepositInput = z.infer<typeof walletDepositSchema>;
