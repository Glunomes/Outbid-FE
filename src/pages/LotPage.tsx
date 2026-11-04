import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LotCard } from '../components/LotCard';
import type { BidHistoryResponse } from '../schemas/bids/bid-history.schema';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import { getAccessToken } from '../services/accessTokenStorage';
import bidsService from '../services/bidsService';
import lotsService from '../services/lotsService';

export const LotPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState<{
    id: string;
    lot: LotDetails | null;
    error: string | null;
  } | null>(null);
  const [bidHistory, setBidHistory] = useState<{
    id: string;
    result: BidHistoryResponse | null;
    error: string | null;
    isLoading: boolean;
    requiresSignIn: boolean;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();
    const hasAccessToken = Boolean(getAccessToken());

    const fetchLot = async () => {
      try {
        const result = await lotsService.getLotById(id, controller.signal);
        setResult({ id, lot: result, error: null });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            id,
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
        const result = await bidsService.getBidHistory(id, controller.signal);
        setBidHistory({
          id,
          result,
          error: null,
          isLoading: false,
          requiresSignIn: false,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setBidHistory({
            id,
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
  }, [id]);

  const isLoading = Boolean(id) && result?.id !== id;
  const currentResult = result?.id === id ? result : null;
  const lot = currentResult?.lot ?? null;
  const error = !id
    ? 'Lot ID is missing.'
    : currentResult
      ? currentResult.error
      : null;
  const currentBidHistory =
    bidHistory?.id === id
      ? bidHistory
      : id
        ? {
            id,
            result: null,
            error: null,
            isLoading: Boolean(getAccessToken()),
            requiresSignIn: !getAccessToken(),
          }
        : null;

  return (
    <section>
      <p>
        <Link to="/lots">Back to lots</Link>
      </p>
      {isLoading && <p>Loading lot…</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && lot && <LotCard lot={lot} variant="details" />}
      {!isLoading && !error && lot && (
        <section aria-labelledby="bid-history-heading">
          <h2 id="bid-history-heading">Bid history</h2>
          {currentBidHistory?.isLoading && <p>Loading bid history…</p>}
          {currentBidHistory?.requiresSignIn && (
            <p>
              <Link to="/auth/login">Sign in</Link> to view bid history.
            </p>
          )}
          {currentBidHistory?.error && (
            <p role="alert">{currentBidHistory.error}</p>
          )}
          {currentBidHistory?.result &&
            (currentBidHistory.result.bids.length > 0 ? (
              <ol>
                {currentBidHistory.result.bids.map((bid, index) => (
                  <li key={`${bid.createdAt}-${index}`}>
                    <span>Price: {bid.amount}</span>{' '}
                    <time dateTime={bid.createdAt}>
                      {new Date(bid.createdAt).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No bids have been placed yet.</p>
            ))}
        </section>
      )}
    </section>
  );
};
