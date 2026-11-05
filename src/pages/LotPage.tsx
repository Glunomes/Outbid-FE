import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BidForm } from '../components/BidForm';
import { BidHistory } from '../components/BidHistory';
import { LotCard } from '../components/LotCard';
import { useLotPageData } from '../hooks/useLotPageData';
import { useLotRealtime } from '../hooks/useLotRealtime';
import {
  getAccessToken,
  getAccessTokenUserId,
} from '../services/accessTokenStorage';
import lotsService from '../services/lotsService';

export const LotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ownerActionError, setOwnerActionError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const pageData = useLotPageData(id);
  const realtime = useLotRealtime(id, pageData.lot);
  const lot = pageData.lot
    ? {
        ...pageData.lot,
        ...(realtime.lot ?? {}),
        seller: pageData.lot.seller,
      }
    : null;
  const displayedBids = realtime.hasSnapshot
    ? realtime.bids
    : (pageData.bidHistory?.result?.bids ?? []);
  const isOwner = Boolean(
    lot && getAccessTokenUserId() === lot.seller.id,
  );
  const hasBids = displayedBids.length > 0;
  const canCancel =
    Boolean(lot) &&
    !hasBids &&
    !pageData.bidHistory?.isLoading &&
    lot?.status !== 'CANCELLED' &&
    lot?.status !== 'ENDED';

  const handleCancelLot = async () => {
    if (!lot || !canCancel) {
      return;
    }

    if (!window.confirm('Cancel this lot? This action cannot be undone.')) {
      return;
    }

    try {
      setOwnerActionError('');
      setIsCancelling(true);
      await lotsService.cancelLot(lot.id);
      navigate('/lots', { replace: true });
    } catch (error) {
      setOwnerActionError(
        error instanceof Error ? error.message : 'Failed to cancel lot.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section>
      <p>
        <Link to="/lots">Back to lots</Link>
      </p>
      {pageData.isLoading && !lot && <p>Loading lot…</p>}
      {pageData.error && !lot && <p role="alert">{pageData.error}</p>}
      {lot && <LotCard lot={lot} variant="details" />}
      {lot && isOwner && (
        <section aria-label="Manage your lot">
          <Link to={`/lots/${lot.id}/edit`}>Edit lot</Link>
          <button
            type="button"
            onClick={handleCancelLot}
            disabled={!canCancel || isCancelling}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel lot'}
          </button>
          {hasBids && (
            <p role="status">A lot with bids cannot be cancelled.</p>
          )}
          {ownerActionError && <p role="alert">{ownerActionError}</p>}
        </section>
      )}
      {lot && (
        <BidForm
          lotId={lot.id}
          isAuthenticated={Boolean(getAccessToken())}
          status={lot.status}
          currentPrice={lot.currentPrice ?? lot.startingPrice}
          auctionEnd={lot.auctionEnd}
        />
      )}
      {lot && (
        <BidHistory
          bids={displayedBids}
          canView={pageData.canViewBidHistory}
          isLoading={pageData.bidHistory?.isLoading ?? false}
          requiresSignIn={pageData.bidHistory?.requiresSignIn ?? false}
          error={pageData.bidHistory?.error ?? null}
          hasRealtimeSnapshot={realtime.hasSnapshot}
          connectionError={realtime.connectionError}
          statusCheckError={realtime.statusCheckError}
        />
      )}
    </section>
  );
};
