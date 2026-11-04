import { useEffect, useState } from 'react';
import { LotCard } from '../components/LotCard';
import lotsService from '../services/lotsService';
import type {
  AuctionStatus,
  LotCatalogItem,
  LotsCatalogQueryInput,
} from '../schemas/lots/lots-catalog.schema';

const PAGE_SIZE = 10;

export const LotsCatalogPage = () => {
  const [lots, setLots] = useState<LotCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AuctionStatus | ''>('');
  const [auctionStartFrom, setAuctionStartFrom] = useState('');
  const [auctionStartTo, setAuctionStartTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      auctionStartFrom &&
      auctionStartTo &&
      auctionStartFrom > auctionStartTo
    ) {
      return;
    }

    let isMounted = true;

    const fetchLots = async () => {
      const params: LotsCatalogQueryInput = {
        page,
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

      try {
        setIsLoading(true);
        setError('');
        const result = await lotsService.getLots(params);
        if (isMounted) {
          setLots(result.lots);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : 'Failed to fetch lots',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLots();
    return () => {
      isMounted = false;
    };
  }, [page, search, status, auctionStartFrom, auctionStartTo]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === '' ? '' : (value as AuctionStatus));
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

  return (
    <section>
      <h2>Lots</h2>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name"
          aria-label="Search lots by name"
        />

        <select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          aria-label="Filter lots by status"
        >
          <option value="">All statuses</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ENDED">ENDED</option>
        </select>

        <label>
          Auction starts from
          <input
            type="date"
            value={auctionStartFrom}
            max={auctionStartTo || undefined}
            onChange={(event) =>
              handleAuctionStartFromChange(event.target.value)
            }
            aria-label="Auction starts from"
          />
        </label>

        <label>
          Auction starts to
          <input
            type="date"
            value={auctionStartTo}
            min={auctionStartFrom || undefined}
            onChange={(event) => handleAuctionStartToChange(event.target.value)}
            aria-label="Auction starts to"
          />
        </label>
      </div>

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <button
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((current) => Math.min(current + 1, totalPages))
            }
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};
