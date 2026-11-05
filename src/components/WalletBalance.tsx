import { useEffect, useState, type FormEvent } from 'react';
import {
  walletDepositSchema,
  type WalletResponse,
} from '../schemas/wallets/wallet.schema';
import {
  AUTH_STATE_CHANGED_EVENT,
  WALLET_UPDATED_EVENT,
} from '../services/authEvents';
import { getAccessToken } from '../services/accessTokenStorage';
import walletsService from '../services/walletsService';

const REFRESH_INTERVAL_MS = 30_000;

export const WalletBalance = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [error, setError] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositMessage, setDepositMessage] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;

    const loadWallet = async () => {
      const authenticated = Boolean(getAccessToken());
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        controller?.abort();
        setWallet(null);
        setError('');
        setIsLoading(false);
        return;
      }

      controller?.abort();
      controller = new AbortController();
      const requestController = controller;

      try {
        setIsLoading(true);
        setError('');
        const result = await walletsService.getMyWallet(
          requestController.signal,
        );
        if (active && !requestController.signal.aborted) {
          setWallet(result);
        }
      } catch (loadError) {
        if (active && !requestController.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load wallet balance.',
          );
        }
      } finally {
        if (active && !requestController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const handleAuthStateChange = () => {
      void loadWallet();
    };
    const handleWalletUpdate = () => {
      void loadWallet();
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChange);
    window.addEventListener(WALLET_UPDATED_EVENT, handleWalletUpdate);
    void loadWallet();

    const interval = window.setInterval(
      () => void loadWallet(),
      REFRESH_INTERVAL_MS,
    );

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener(
        AUTH_STATE_CHANGED_EVENT,
        handleAuthStateChange,
      );
      window.removeEventListener(WALLET_UPDATED_EVENT, handleWalletUpdate);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDepositError('');
    setDepositMessage('');

    const parsedAmount = walletDepositSchema.safeParse({
      amount: depositAmount,
    });
    if (!parsedAmount.success) {
      setDepositError(
        parsedAmount.error.issues[0]?.message ?? 'Enter a valid amount.',
      );
      return;
    }

    try {
      setIsDepositing(true);
      const updatedWallet =
        await walletsService.depositToMyWallet(parsedAmount.data);
      setWallet(updatedWallet);
      setDepositAmount('');
      setDepositMessage(
        'Virtual funds added. This is not a payment and no money was charged.',
      );
    } catch (depositFailure) {
      setDepositError(
        depositFailure instanceof Error
          ? depositFailure.message
          : 'Failed to add virtual funds.',
      );
    } finally {
      setIsDepositing(false);
    }
  };

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
      <form onSubmit={handleDeposit} noValidate>
        <h3>Add virtual funds</h3>
        <p>
          Demo balance only. This adds virtual funds and is not a payment; no
          money will be charged.
        </p>
        <label htmlFor="wallet-deposit-amount">Amount</label>
        <input
          id="wallet-deposit-amount"
          type="text"
          inputMode="decimal"
          value={depositAmount}
          onChange={(event) => {
            setDepositAmount(event.target.value);
            setDepositError('');
            setDepositMessage('');
          }}
          aria-invalid={Boolean(depositError)}
          aria-describedby={
            depositError ? 'wallet-deposit-error' : undefined
          }
        />
        {depositError && (
          <p id="wallet-deposit-error" role="alert">
            {depositError}
          </p>
        )}
        {depositMessage && <p role="status">{depositMessage}</p>}
        <button type="submit" disabled={isDepositing}>
          {isDepositing ? 'Adding virtual funds…' : 'Add virtual funds'}
        </button>
      </form>
    </aside>
  );
};
