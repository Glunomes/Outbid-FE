import api from './httpClient';
import {
  lotsCatalogResponseSchema,
  type LotsCatalogResponse,
} from '../schemas/lots/lots-catalog.schema';
import {
  lotDetailsSchema,
  type LotDetails,
} from '../schemas/lots/lot-details.schema';

const getLots = async (): Promise<LotsCatalogResponse> => {
  const response = await api.get('/lots');
  return lotsCatalogResponseSchema.parse(response.data);
};

const getLotById = async (
  id: string,
  signal?: AbortSignal,
): Promise<LotDetails> => {
  const response = await api.get(`/lots/${id}`, { signal });
  return lotDetailsSchema.parse(response.data);
};

export default {
  getLots,
  getLotById,
};
