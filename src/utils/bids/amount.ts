const AMOUNT_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

export const parseAmountToCents = (amount: string): bigint | null => {
  if (!AMOUNT_PATTERN.test(amount)) {
    return null;
  }

  const [whole, fraction = ''] = amount.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
};

export const formatCents = (cents: bigint): string =>
  `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
