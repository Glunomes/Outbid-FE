import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { LotsPagination } from '../components/LotsPagination';
import { getAccessToken } from '../services/accessTokenStorage';
import lotsService from '../services/lotsService';
import { formatDateTime } from '../utils/dates/dateTime';
import { PAGE_SIZE, usePaginatedList } from '../hooks/usePaginatedList';

export const MyLotsPage = () => {
  const [isAuthenticated] = useState(() => Boolean(getAccessToken()));
  const [page, setPage] = useState(1);
  const loadPage = useCallback(
    async (requestedPage: number, signal: AbortSignal) => {
      const result = await lotsService.getMyLots(
        { page: requestedPage, limit: PAGE_SIZE },
        signal,
      );
      return { lots: result.lots, totalPages: result.totalPages };
    },
    [],
  );
  const { lots, totalPages, error, isLoading } = usePaginatedList({
    page,
    loadPage,
    enabled: isAuthenticated,
    errorFallback: 'Failed to fetch your lots.',
  });

  return (
    <section>
      <h2>My lots</h2>

      {!isAuthenticated && (
        <p>
          <Link to="/auth/login">Sign in</Link> to view your lots.
        </p>
      )}
      {isLoading && <p>Loading your lots…</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && isAuthenticated && lots.length === 0 && (
        <p>You have not created any lots yet.</p>
      )}

      <ul>
        {lots.map((lot) => (
          <li key={lot.id}>
            <article>
              <h3>
                <Link to={`/lots/${lot.id}`}>{lot.name}</Link>
              </h3>
              {lot.description && <p>{lot.description}</p>}
              <p>Status: {lot.status}</p>
              <p>
                Price: {lot.currentPrice ?? lot.startingPrice}
                {lot.currentPrice && ` (starting at ${lot.startingPrice})`}
              </p>
              <p>Starts: {formatDateTime(lot.auctionStart)}</p>
              <p>Ends: {formatDateTime(lot.auctionEnd)}</p>
              {(lot.status === 'DRAFT' || lot.status === 'SCHEDULED') && (
                <Link to={`/lots/${lot.id}/edit`}>Edit lot</Link>
              )}
            </article>
          </li>
        ))}
      </ul>

      {!isLoading && !error && totalPages > 1 && (
        <LotsPagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
          onNext={() => setPage((current) => Math.min(current + 1, totalPages))}
        />
      )}
    </section>
  );
};
