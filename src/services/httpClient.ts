import axios from 'axios';
import { clearAccessToken, getAccessToken } from './accessTokenStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

const getBackendMessage = (data: unknown): string | undefined => {
  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return undefined;
    }
  }

  if (typeof parsed !== 'object' || parsed === null || !('message' in parsed)) {
    return undefined;
  }

  const message = parsed.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string =>
        typeof item === 'string' && Boolean(item.trim()),
    );
    return messages.length > 0 ? messages.join(', ') : undefined;
  }

  return undefined;
};

const getErrorMessage = (status: number, backendMessage?: string) => {
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }
  if (backendMessage) {
    return backendMessage;
  }

  switch (status) {
    case 400:
      return 'Please check the information you entered.';
    case 401:
      return 'Your session has expired or your login details are invalid. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested data could not be found.';
    case 409:
      return 'The data conflicts with existing data.';
    case 429:
      return 'Too many requests. Please try again later.';
    default:
      return `The request failed (HTTP ${status}).`;
  }
};

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
    }

    return Promise.reject(
      new Error(getErrorMessage(status, getBackendMessage(data)), {
        cause: error,
      }),
    );
  },
);

export default api;
