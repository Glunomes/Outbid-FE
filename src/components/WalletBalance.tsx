import { useWalletBalance } from '../hooks/useWalletBalance';

export const WalletBalance = () => {
  const { isAuthenticated, wallet, isLoading } = useWalletBalance();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <p aria-live="polite">
      Available balance:{' '}
      {wallet?.availableBalance ?? (isLoading ? 'Loading…' : 'Unavailable')}
    </p>
  );
};
