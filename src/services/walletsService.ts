import {
  walletDepositSchema,
  walletResponseSchema,
  type WalletDepositInput,
  type WalletResponse,
} from '../schemas/wallets/wallet.schema';
import api from './httpClient';

const getMyWallet = async (signal?: AbortSignal): Promise<WalletResponse> => {
  const response = await api.get('/wallets/me', { signal });
  return walletResponseSchema.parse(response.data);
};

const depositToMyWallet = async (
  data: WalletDepositInput,
): Promise<WalletResponse> => {
  const request = walletDepositSchema.parse(data);
  const response = await api.post('/wallets/me/deposit', request);
  return walletResponseSchema.parse(response.data);
};

export default { getMyWallet, depositToMyWallet };
