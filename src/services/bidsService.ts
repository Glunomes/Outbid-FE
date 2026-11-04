import api from './httpClient';
import {
  bidHistoryResponseSchema,
  type BidHistoryResponse,
} from '../schemas/bids/bid-history.schema';

const getBidHistory = async (
  lotId: string,
  signal?: AbortSignal,
): Promise<BidHistoryResponse> => {
  const response = await api.get(`/lots/${lotId}/bids`, { signal });
  return bidHistoryResponseSchema.parse(response.data);
};

export default {
  getBidHistory,
};
