import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/api';
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
  return response.data;
};

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  const tokens = response.data;

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
