import { Link, useParams } from 'react-router-dom';
import { BidForm } from '../components/BidForm';
import { BidHistory } from '../components/BidHistory';
import { LotCard } from '../components/LotCard';
import { useLotPageData } from '../hooks/useLotPageData';
import { useLotRealtime } from '../hooks/useLotRealtime';
import { getAccessToken } from '../services/accessTokenStorage';

export const LotPage = () => {
  const { id } = useParams();
  const pageData = useLotPageData(id);
  const realtime = useLotRealtime(id, pageData.lot);
  const lot = realtime.lot ?? pageData.lot;
  const displayedBids = realtime.hasSnapshot
    ? realtime.bids
    : (pageData.bidHistory?.result?.bids ?? []);

  return (
    <section>
      <p>
        <Link to="/lots">Back to lots</Link>
      </p>
      {pageData.isLoading && !lot && <p>Loading lot…</p>}
      {pageData.error && !lot && <p role="alert">{pageData.error}</p>}
      {lot && <LotCard lot={lot} variant="details" />}
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
