import type { AuctionStatus } from '../schemas/lots/lots-catalog.schema';

type LotsCatalogFiltersProps = {
  search: string;
  status: AuctionStatus | '';
  auctionStartFrom: string;
  auctionStartTo: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AuctionStatus | '') => void;
  onAuctionStartFromChange: (value: string) => void;
  onAuctionStartToChange: (value: string) => void;
};

export const LotsCatalogFilters = ({
  search,
  status,
  auctionStartFrom,
  auctionStartTo,
  onSearchChange,
  onStatusChange,
  onAuctionStartFromChange,
  onAuctionStartToChange,
}: LotsCatalogFiltersProps) => (
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
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search by name"
      aria-label="Search lots by name"
    />

    <select
      value={status}
      onChange={(event) =>
        onStatusChange(event.target.value as AuctionStatus | '')
      }
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
        onChange={(event) => onAuctionStartFromChange(event.target.value)}
        aria-label="Auction starts from"
      />
    </label>

    <label>
      Auction starts to
      <input
        type="date"
        value={auctionStartTo}
        min={auctionStartFrom || undefined}
        onChange={(event) => onAuctionStartToChange(event.target.value)}
        aria-label="Auction starts to"
      />
    </label>
  </div>
);
