const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const saveAccessToken = (accessToken: string) =>
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

export const clearAccessToken = () =>
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
