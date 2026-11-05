import api from './httpClient';
import {
  bidHistoryResponseSchema,
  type BidHistoryResponse,
} from '../schemas/bids/bid-history.schema';
import {
  makeBidResponseSchema,
  type MakeBidRequest,
  type MakeBidResponse,
} from '../schemas/bids/make-bid.schema';
import { notifyWalletUpdated } from './authEvents';

const getBidHistory = async (
  lotId: string,
  signal?: AbortSignal,
): Promise<BidHistoryResponse> => {
  const response = await api.get(`/lots/${lotId}/bids`, { signal });
  return bidHistoryResponseSchema.parse(response.data);
};

const makeBid = async (
  lotId: string,
  data: MakeBidRequest,
): Promise<MakeBidResponse> => {
  const response = await api.post(`/lots/${lotId}/bids`, data);
  const result = makeBidResponseSchema.parse(response.data);
  notifyWalletUpdated();
  return result;
};

export default {
  getBidHistory,
  makeBid,
};
