export const SESSION_EXPIRED_EVENT = 'outbid:session-expired';
export const AUTH_STATE_CHANGED_EVENT = 'outbid:auth-state-changed';
export const WALLET_UPDATED_EVENT = 'outbid:wallet-updated';

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

export const notifyAuthStateChanged = () => {
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
};

export const notifyWalletUpdated = () => {
  window.dispatchEvent(new Event(WALLET_UPDATED_EVENT));
};
