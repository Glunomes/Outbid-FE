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
  return makeBidResponseSchema.parse(response.data);
};

export default {
  getBidHistory,
  makeBid,
};
