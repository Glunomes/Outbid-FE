export const SESSION_EXPIRED_EVENT = 'outbid:session-expired';

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
