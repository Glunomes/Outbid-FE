import { z } from 'zod';
import { notifyAuthStateChanged } from './authEvents';

const ACCESS_TOKEN_KEY = 'accessToken';
const accessTokenPayloadSchema = z.object({ sub: z.uuid() });

export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const saveAccessToken = (accessToken: string) => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  notifyAuthStateChanged();
};

export const clearAccessToken = () => {
  const hadAccessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) !== null;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  if (hadAccessToken) {
    notifyAuthStateChanged();
  }
};

export const getAccessTokenUserId = (): string | null => {
  const token = getAccessToken();
  const payload = token?.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(base64)) as unknown;
    const result = accessTokenPayloadSchema.safeParse(decoded);
    return result.success ? result.data.sub : null;
  } catch {
    return null;
  }
};
