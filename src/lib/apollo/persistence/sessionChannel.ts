const CHANNEL_NAME = 'mpdx-session';
const SESSION_ENDED = 'session-ended';

export const broadcastSessionEnded = (): void => {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(SESSION_ENDED);
  channel.close();
};

export const onSessionEnded = (listener: () => void): (() => void) => {
  if (typeof BroadcastChannel === 'undefined') {
    return () => {};
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event.data === SESSION_ENDED) {
      listener();
    }
  };
  return () => channel.close();
};
