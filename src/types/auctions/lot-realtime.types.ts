import type { z } from 'zod';
import type { BidHistoryResponse } from '../../schemas/bids/bid-history.schema';
import type {
  auctionExtendedSchema,
  bidPlacedSchema,
  lotStateSchema,
} from '../../schemas/auctions/lot-realtime.schema';

export type LotStateEvent = z.infer<typeof lotStateSchema>;
export type BidPlacedEvent = z.infer<typeof bidPlacedSchema>;
export type AuctionExtendedEvent = z.infer<typeof auctionExtendedSchema>;

export type LotBid = BidHistoryResponse['bids'][number];

export type LotRealtimeState = {
  lotId: string;
  lot: LotStateEvent['lot'] | null;
  hasSnapshot: boolean;
  bids: LotBid[];
  seenBidIds: string[];
  connectionError: string | null;
};
