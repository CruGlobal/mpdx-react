import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void): (() => void) => {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
};

const getSnapshot = (): boolean => navigator.onLine;

const getServerSnapshot = (): boolean => true;

// navigator.onLine is only reliable when it is false. A true value means the
// device has a network connection, not that MPDX is reachable.
export const useIsOnline = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
