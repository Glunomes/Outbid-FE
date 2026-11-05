import {
  walletResponseSchema,
  type WalletResponse,
} from '../schemas/wallets/wallet.schema';
import api from './httpClient';

const getMyWallet = async (signal?: AbortSignal): Promise<WalletResponse> => {
  const response = await api.get('/wallets/me', { signal });
  return walletResponseSchema.parse(response.data);
};

export default { getMyWallet };
