import type { BidHistoryResponse } from '../../schemas/bids/bid-history.schema';
import type { LotDetails } from '../../schemas/lots/lot-details.schema';

export type LotPageResult = {
  id: string;
  lot: LotDetails | null;
  error: string | null;
};

export type LotPageBidHistory = {
  id: string;
  result: BidHistoryResponse | null;
  error: string | null;
  isLoading: boolean;
  requiresSignIn: boolean;
};
