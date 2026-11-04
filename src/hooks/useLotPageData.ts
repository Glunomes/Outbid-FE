import { useEffect, useState } from 'react';
import type { BidHistoryResponse } from '../schemas/bids/bid-history.schema';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import { getAccessToken } from '../services/accessTokenStorage';
import bidsService from '../services/bidsService';
import lotsService from '../services/lotsService';
import type {
  LotPageBidHistory,
  LotPageResult,
} from '../types/lots/lot-page.types';

type UseLotPageDataResult = {
  lot: LotDetails | null;
  error: string | null;
  isLoading: boolean;
  bidHistory: LotPageBidHistory | null;
  canViewBidHistory: boolean;
};

export const useLotPageData = (
  lotId: string | undefined,
): UseLotPageDataResult => {
  const [result, setResult] = useState<LotPageResult | null>(null);
  const [bidHistory, setBidHistory] = useState<LotPageBidHistory | null>(null);

  useEffect(() => {
    if (!lotId) {
      return;
    }

    const controller = new AbortController();
    const hasAccessToken = Boolean(getAccessToken());

    const fetchLot = async () => {
      try {
        const lot = await lotsService.getLotById(lotId, controller.signal);
        setResult({ id: lotId, lot, error: null });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            id: lotId,
            lot: null,
            error:
              error instanceof Error ? error.message : 'Failed to fetch lot',
          });
        }
      }
    };

    const fetchBidHistory = async () => {
      if (!hasAccessToken) {
        return;
      }

      try {
        const response: BidHistoryResponse = await bidsService.getBidHistory(
          lotId,
          controller.signal,
        );
        setBidHistory({
          id: lotId,
          result: response,
          error: null,
          isLoading: false,
          requiresSignIn: false,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setBidHistory({
            id: lotId,
            result: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch bid history',
            isLoading: false,
            requiresSignIn: false,
          });
        }
      }
    };

    void fetchLot();
    void fetchBidHistory();
    return () => controller.abort();
  }, [lotId]);

  const currentResult = result?.id === lotId ? result : null;
  const canViewBidHistory = Boolean(getAccessToken());
  const currentBidHistory =
    bidHistory?.id === lotId
      ? bidHistory
      : lotId
        ? {
            id: lotId,
            result: null,
            error: null,
            isLoading: canViewBidHistory,
            requiresSignIn: !canViewBidHistory,
          }
        : null;

  return {
    lot: currentResult?.lot ?? null,
    error: !lotId ? 'Lot ID is missing.' : (currentResult?.error ?? null),
    isLoading: Boolean(lotId) && !currentResult,
    bidHistory: currentBidHistory,
    canViewBidHistory,
  };
};
