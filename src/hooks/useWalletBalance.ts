import { useCallback, useEffect, useRef, useState } from 'react';
import type { WalletResponse } from '../schemas/wallets/wallet.schema';
import {
  AUTH_STATE_CHANGED_EVENT,
  WALLET_UPDATED_EVENT,
} from '../services/authEvents';
import { getAccessToken } from '../services/accessTokenStorage';
import walletsService from '../services/walletsService';

const REFRESH_INTERVAL_MS = 30_000;

export const useWalletBalance = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    const authenticated = Boolean(getAccessToken());
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      controllerRef.current?.abort();
      controllerRef.current = null;
      setWallet(null);
      setError('');
      setIsLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setIsLoading(true);
      setError('');
      const result = await walletsService.getMyWallet(controller.signal);
      if (!controller.signal.aborted) {
        setWallet(result);
      }
    } catch (loadError) {
      if (!controller.signal.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load wallet balance.',
        );
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  const updateWallet = useCallback((updatedWallet: WalletResponse) => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setWallet(updatedWallet);
    setError('');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleRefresh);
    window.addEventListener(WALLET_UPDATED_EVENT, handleRefresh);
    const initialRequest = window.setTimeout(() => void refresh(), 0);

    const interval = window.setInterval(
      () => void refresh(),
      REFRESH_INTERVAL_MS,
    );

    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleRefresh);
      window.removeEventListener(WALLET_UPDATED_EVENT, handleRefresh);
    };
  }, [refresh]);

  return {
    isAuthenticated,
    wallet,
    error,
    isLoading,
    updateWallet,
  };
};
