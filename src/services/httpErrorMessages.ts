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
  if (
    typeof message === 'object' &&
    message !== null &&
    'message' in message &&
    typeof message.message === 'string' &&
    message.message.trim()
  ) {
    return message.message;
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

export const getHttpErrorMessage = (status: number, data: unknown) =>
  getErrorMessage(status, getBackendMessage(data));
