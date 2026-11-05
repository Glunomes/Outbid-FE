import { useCallback, useState } from 'react';
import { LotCard } from '../components/LotCard';
import { LotsCatalogFilters } from '../components/LotsCatalogFilters';
import { LotsPagination } from '../components/LotsPagination';
import lotsService from '../services/lotsService';
import { PAGE_SIZE, usePaginatedList } from '../hooks/usePaginatedList';
import type {
  AuctionStatus,
  LotCatalogItem,
  LotsCatalogQueryInput,
} from '../schemas/lots/lots-catalog.schema';

export const LotsCatalogPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AuctionStatus | ''>('');
  const [auctionStartFrom, setAuctionStartFrom] = useState('');
  const [auctionStartTo, setAuctionStartTo] = useState('');
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: AuctionStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  const handleAuctionStartFromChange = (value: string) => {
    setAuctionStartFrom(value);
    setPage(1);
  };

  const handleAuctionStartToChange = (value: string) => {
    setAuctionStartTo(value);
    setPage(1);
  };

  const dateRangeError =
    auctionStartFrom && auctionStartTo && auctionStartFrom > auctionStartTo
      ? 'Start date must not be after end date.'
      : '';
  const loadPage = useCallback(
    async (requestedPage: number, signal: AbortSignal) => {
      const params: LotsCatalogQueryInput = {
        page: requestedPage,
        limit: PAGE_SIZE,
        name: search.trim() || undefined,
        status: status || undefined,
        auctionStartFrom: auctionStartFrom
          ? new Date(`${auctionStartFrom}T00:00:00`).toISOString()
          : undefined,
        auctionStartTo: auctionStartTo
          ? new Date(`${auctionStartTo}T23:59:59.999`).toISOString()
          : undefined,
      };

      const result = await lotsService.getLots(params, signal);
      return { lots: result.lots, totalPages: result.totalPages };
    },
    [search, status, auctionStartFrom, auctionStartTo],
  );
  const { lots, totalPages, error, isLoading } =
    usePaginatedList<LotCatalogItem>({
      page,
      loadPage,
      enabled: !dateRangeError,
      errorFallback: 'Failed to fetch lots',
    });

  return (
    <section>
      <h2>Lots</h2>

      <LotsCatalogFilters
        search={search}
        status={status}
        auctionStartFrom={auctionStartFrom}
        auctionStartTo={auctionStartTo}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onAuctionStartFromChange={handleAuctionStartFromChange}
        onAuctionStartToChange={handleAuctionStartToChange}
      />

      {dateRangeError && <p role="alert">{dateRangeError}</p>}
      {isLoading && !dateRangeError && <p>Loading lots…</p>}
      {error && !dateRangeError && <p role="alert">{error}</p>}
      {!isLoading && !error && !dateRangeError && lots.length === 0 && (
        <p>No lots found.</p>
      )}

      <ul>
        {!dateRangeError &&
          lots.map((lot) => (
            <li key={lot.id}>
              <LotCard lot={lot} />
            </li>
          ))}
      </ul>

      {!isLoading && !error && !dateRangeError && totalPages > 1 && (
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
