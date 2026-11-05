import api from './httpClient';
import {
  lotsCatalogResponseSchema,
  type LotsCatalogQueryInput,
  type LotsCatalogResponse,
} from '../schemas/lots/lots-catalog.schema';
import {
  lotDetailsSchema,
  type LotDetails,
} from '../schemas/lots/lot-details.schema';
import { type CreateLotInput } from '../schemas/lots/create-lot.schema';
import {
  lotResponseSchema,
  type LotResponse,
} from '../schemas/lots/lot-response.schema';
import {
  updateLotResponseSchema,
  type UpdateLotRequest,
  type UpdateLotResponse,
} from '../schemas/lots/update-lot.schema';
import {
  myLotsResponseSchema,
  type MyLotsQueryInput,
  type MyLotsResponse,
} from '../schemas/lots/my-lots.schema';

const getLots = async (
  params?: LotsCatalogQueryInput,
  signal?: AbortSignal,
): Promise<LotsCatalogResponse> => {
  const response = await api.get('/lots', { params, signal });
  return lotsCatalogResponseSchema.parse(response.data);
};

const getMyLots = async (
  params?: MyLotsQueryInput,
  signal?: AbortSignal,
): Promise<MyLotsResponse> => {
  const response = await api.get('/lots/mine', { params, signal });
  return myLotsResponseSchema.parse(response.data);
};

const getLotById = async (
  id: string,
  signal?: AbortSignal,
): Promise<LotDetails> => {
  const response = await api.get(`/lots/${id}`, { signal });
  return lotDetailsSchema.parse(response.data);
};

const createLot = async (data: CreateLotInput): Promise<LotResponse> => {
  const response = await api.post('/lots', data);
  return lotResponseSchema.parse(response.data);
};

const updateLot = async (
  id: string,
  data: UpdateLotRequest,
): Promise<UpdateLotResponse> => {
  const response = await api.put(`/lots/${id}`, data);
  return updateLotResponseSchema.parse(response.data);
};

const cancelLot = async (id: string): Promise<void> => {
  await api.delete(`/lots/${id}`);
};

export default {
  getLots,
  getMyLots,
  getLotById,
  createLot,
  updateLot,
  cancelLot,
};
