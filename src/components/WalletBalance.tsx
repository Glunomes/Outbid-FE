import { WalletDepositForm } from './WalletDepositForm';
import { useWalletBalance } from '../hooks/useWalletBalance';

export const WalletBalance = () => {
  const { isAuthenticated, wallet, error, isLoading, updateWallet } =
    useWalletBalance();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside aria-label="Wallet balance">
      <h2>Balance</h2>
      {isLoading && !wallet && <p>Loading balance…</p>}
      {error && <p role="alert">{error}</p>}
      {wallet && (
        <dl>
          <div>
            <dt>Available</dt>
            <dd>{wallet.availableBalance}</dd>
          </div>
          <div>
            <dt>Reserved</dt>
            <dd>{wallet.reservedBalance}</dd>
          </div>
        </dl>
      )}
      {!wallet && !isLoading && !error && (
        <p>Balance is currently unavailable.</p>
      )}
      <WalletDepositForm onWalletUpdated={updateWallet} />
    </aside>
  );
};
