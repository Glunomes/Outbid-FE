import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LotCard } from '../components/LotCard';
import { useLotRealtime } from '../hooks/useLotRealtime';
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

  const currentResult = result?.id === id ? result : null;
  const initialLot = currentResult?.lot ?? null;
  const realtime = useLotRealtime(id, initialLot);

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

  const isLoading = Boolean(id) && !realtime.lot && result?.id !== id;
  const lot = realtime.lot ?? currentResult?.lot ?? null;
  const error = lot
    ? null
    : !id
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
  const canViewBidHistory = Boolean(getAccessToken());
  const displayedBids = realtime.hasSnapshot
    ? realtime.bids
    : (currentBidHistory?.result?.bids ?? []);

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
          {realtime.connectionError && (
            <p role="status">{realtime.connectionError}</p>
          )}
          {realtime.statusCheckError && (
            <p role="status">
              Could not verify the auction status: {realtime.statusCheckError}
              Retrying…
            </p>
          )}
          {currentBidHistory?.isLoading && !realtime.hasSnapshot && (
            <p>Loading bid history…</p>
          )}
          {currentBidHistory?.requiresSignIn && (
            <p>
              <Link to="/auth/login">Sign in</Link> to view bid history.
            </p>
          )}
          {currentBidHistory?.error && !realtime.hasSnapshot && (
            <p role="alert">{currentBidHistory.error}</p>
          )}
          {canViewBidHistory &&
            (displayedBids.length > 0 ? (
              <ol>
                {displayedBids.map((bid, index) => (
                  <li key={`${bid.createdAt}-${index}`}>
                    <span>Price: {bid.amount}</span>{' '}
                    <time dateTime={bid.createdAt}>
                      {new Date(bid.createdAt).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              !currentBidHistory?.isLoading &&
              !currentBidHistory?.requiresSignIn && (
                <p>No bids have been placed yet.</p>
              )
            ))}
        </section>
      )}
    </section>
  );
};
