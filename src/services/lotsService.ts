import api from './httpClient';
import {
  lotsCatalogResponseSchema,
  type LotsCatalogResponse,
} from '../schemas/lots/lots-catalog.schema';

const getLots = async (): Promise<LotsCatalogResponse> => {
  const response = await api.get('/lots');
  return lotsCatalogResponseSchema.parse(response.data);
};

export default {
  getLots,
};
