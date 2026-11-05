import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LotsPagination } from '../components/LotsPagination';
import type { MyLotsResponse } from '../schemas/lots/my-lots.schema';
import { getAccessToken } from '../services/accessTokenStorage';
import lotsService from '../services/lotsService';

const PAGE_SIZE = 10;

export const MyLotsPage = () => {
  const [isAuthenticated] = useState(() => Boolean(getAccessToken()));
  const [result, setResult] = useState<MyLotsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    const fetchLots = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await lotsService.getMyLots(
          { page, limit: PAGE_SIZE },
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setResult(response);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to fetch your lots.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLots();
    return () => controller.abort();
  }, [isAuthenticated, page]);

  return (
    <section>
      <h2>My lots</h2>
      <p>
        <Link to="/lots">All lots</Link>
        {' · '}
        <Link to="/lots/new">Create a lot</Link>
      </p>

      {!isAuthenticated && (
        <p>
          <Link to="/auth/login">Sign in</Link> to view your lots.
        </p>
      )}
      {isLoading && <p>Loading your lots…</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && isAuthenticated && result?.lots.length === 0 && (
        <p>You have not created any lots yet.</p>
      )}

      <ul>
        {result?.lots.map((lot) => (
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
              <p>
                Starts:{' '}
                {lot.auctionStart
                  ? new Date(lot.auctionStart).toLocaleString()
                  : 'Not scheduled'}
              </p>
              <p>
                Ends:{' '}
                {lot.auctionEnd
                  ? new Date(lot.auctionEnd).toLocaleString()
                  : 'Not scheduled'}
              </p>
              {(lot.status === 'DRAFT' || lot.status === 'SCHEDULED') && (
                <Link to={`/lots/${lot.id}/edit`}>Edit lot</Link>
              )}
            </article>
          </li>
        ))}
      </ul>

      {!isLoading && !error && result && result.totalPages > 1 && (
        <LotsPagination
          page={page}
          totalPages={result.totalPages}
          onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
          onNext={() =>
            setPage((current) => Math.min(current + 1, result.totalPages))
          }
        />
      )}
    </section>
  );
};
