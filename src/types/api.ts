export type AuctionStatus =
  'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type LotsCatalogQuery = {
  page?: number;
  limit?: number;
  name?: string;
  status?: AuctionStatus;
  auctionStartFrom?: string;
  auctionStartTo?: string;
};

export type LotCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  auctionStart: string | null;
  auctionEnd: string | null;
  status: AuctionStatus;
};

export type LotsCatalogResponse = {
  lots: LotCatalogItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LotResponse = {
  id: string;
  name: string;
  description: string | null;
  startingPrice: string;
  currentPrice: string | null;
  auctionStart: string | null;
  auctionEnd: string | null;
  status: AuctionStatus;
  createdAt: string;
  updatedAt: string;
};

export type LotDetailsResponse = LotResponse & {
  seller: { name: string };
};

export type CreateLotRequest = {
  name: string;
  description?: string;
  startingPrice: string;
  auctionStart?: string;
  auctionEnd?: string;
};

export type UpdateLotRequest = {
  name: string;
  description: string | null;
  startingPrice: string;
  auctionStart: string | null;
  auctionEnd: string | null;
};

export type CancelLotResponse = {
  lotId: string;
  cancelled: true;
};

export type BidHistoryResponse = {
  lotId: string;
  bids: Array<{
    amount: string;
    createdAt: string;
  }>;
};

export type MakeBidRequest = {
  amount: string;
};

export type MakeBidResponse = {
  bidId: string;
  lotId: string;
  amount: string;
  currentPrice: string;
  auctionEnd: string;
};

export type WalletResponse = {
  availableBalance: string;
  reservedBalance: string;
};

export type WalletDepositRequest = {
  amount: string;
};
