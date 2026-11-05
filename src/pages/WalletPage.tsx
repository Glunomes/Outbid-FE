import { Link } from 'react-router-dom';
import { WalletDepositForm } from '../components/WalletDepositForm';
import { useWalletBalance } from '../hooks/useWalletBalance';

export const WalletPage = () => {
  const { isAuthenticated, wallet, error, isLoading, updateWallet } =
    useWalletBalance();

  return (
    <main>
      <h2>Balance</h2>
      {!isAuthenticated ? (
        <p>
          <Link to="/auth/login">Sign in</Link> to view your balance and add
          virtual funds.
        </p>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
};
