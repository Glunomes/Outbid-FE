import axios from 'axios';
import { clearAccessToken, getAccessToken } from './accessTokenStorage';
import { notifySessionExpired } from './authEvents';
import { getHttpErrorMessage } from './httpErrorMessages';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const accessToken = config.skipAuth ? null : getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error) || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.config?.signal?.aborted) {
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(
        new Error(
          'The server is taking too long to respond. Please try again.',
          {
            cause: error,
          },
        ),
      );
    }

    if (!error.response) {
      return Promise.reject(
        new Error(
          'Could not connect to the server. Check your connection and try again.',
          { cause: error },
        ),
      );
    }

    const { status, data } = error.response;
    if (status === 401) {
      clearAccessToken();
      if (!error.config?.skipAuth) {
        notifySessionExpired();
      }
    }

    return Promise.reject(
      new Error(getHttpErrorMessage(status, data), {
        cause: error,
      }),
    );
  },
);

export default api;
