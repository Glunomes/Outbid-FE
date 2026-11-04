import {
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
} from '../schemas/auth/login.schema';
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from '../schemas/auth/register.schema';
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from './accessTokenStorage';
import api from './httpClient';

const registerUser = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return registerResponseSchema.parse(response.data);
};

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  const tokens = loginResponseSchema.parse(response.data);

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error(
      'The server returned an incomplete authentication response.',
    );
  }

  saveAccessToken(tokens.accessToken);
  return tokens;
};

export default {
  getAccessToken,
  login,
  logout: clearAccessToken,
  registerUser,
};
