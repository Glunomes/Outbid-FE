import { Link } from 'react-router-dom';
import type { LotBid } from '../types/auctions/lot-realtime.types';

type BidHistoryProps = {
  bids: LotBid[];
  canView: boolean;
  isLoading: boolean;
  requiresSignIn: boolean;
  error: string | null;
  hasRealtimeSnapshot: boolean;
  connectionError: string | null;
  statusCheckError: string | null;
};

export const BidHistory = ({
  bids,
  canView,
  isLoading,
  requiresSignIn,
  error,
  hasRealtimeSnapshot,
  connectionError,
  statusCheckError,
}: BidHistoryProps) => (
  <section aria-labelledby="bid-history-heading">
    <h2 id="bid-history-heading">Bid history</h2>
    {connectionError && <p role="status">{connectionError}</p>}
    {statusCheckError && (
      <p role="status">
        Could not verify the auction status: {statusCheckError} Retrying…
      </p>
    )}
    {isLoading && !hasRealtimeSnapshot && <p>Loading bid history…</p>}
    {requiresSignIn && (
      <p>
        <Link to="/auth/login">Sign in</Link> to view bid history.
      </p>
    )}
    {error && !hasRealtimeSnapshot && <p role="alert">{error}</p>}
    {canView &&
      (bids.length > 0 ? (
        <ol>
          {bids.map((bid, index) => (
            <li key={`${bid.createdAt}-${index}`}>
              <span>Price: {bid.amount}</span>{' '}
              <time dateTime={bid.createdAt}>
                {new Date(bid.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        !isLoading && !requiresSignIn && <p>No bids have been placed yet.</p>
      ))}
  </section>
);
