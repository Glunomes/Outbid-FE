type AuctionDate = string | null | undefined;
type AuctionDateField = 'auctionStart' | 'auctionEnd';
type ValidationMode = 'create' | 'update';

export type AuctionScheduleIssue = {
  path: AuctionDateField;
  message: string;
};

const MAX_AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const getAuctionScheduleIssues = (
  auctionStart: AuctionDate,
  auctionEnd: AuctionDate,
  mode: ValidationMode,
): AuctionScheduleIssue[] => {
  const issues: AuctionScheduleIssue[] = [];
  const hasAuctionStart = auctionStart !== undefined;
  const hasAuctionEnd = auctionEnd !== undefined;

  if (mode === 'create' && hasAuctionStart !== hasAuctionEnd) {
    issues.push({
      path: hasAuctionStart ? 'auctionEnd' : 'auctionStart',
      message: hasAuctionStart
        ? 'Auction end time is required when start time is set.'
        : 'Auction start time is required when end time is set.',
    });
  }

  if (mode === 'update' && (auctionStart === null) !== (auctionEnd === null)) {
    issues.push({
      path: auctionStart === null ? 'auctionEnd' : 'auctionStart',
      message: 'Auction start and end times must both be set or both be empty.',
    });
    return issues;
  }

  if (
    typeof auctionStart === 'string' &&
    new Date(auctionStart).getTime() < Date.now()
  ) {
    issues.push({
      path: 'auctionStart',
      message: 'Auction start time cannot be in the past.',
    });
  }

  if (typeof auctionStart !== 'string' || typeof auctionEnd !== 'string') {
    return issues;
  }

  const durationMs =
    new Date(auctionEnd).getTime() - new Date(auctionStart).getTime();

  if (durationMs <= 0) {
    issues.push({
      path: 'auctionEnd',
      message: 'Auction end time must be after the start time.',
    });
  } else if (durationMs > MAX_AUCTION_DURATION_MS) {
    issues.push({
      path: 'auctionEnd',
      message: 'Auction duration cannot exceed 7 days.',
    });
  }

  return issues;
};
