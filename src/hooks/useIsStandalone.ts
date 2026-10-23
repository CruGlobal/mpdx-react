import { useSyncExternalStore } from 'react';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const STANDALONE_QUERY = '(display-mode: standalone)';

const subscribe = (onStoreChange: () => void): (() => void) => {
  const mediaQueryList = window.matchMedia(STANDALONE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);
  return () => mediaQueryList.removeEventListener('change', onStoreChange);
};

// navigator.standalone covers iOS Safari, which does not support the
// display-mode media query for home screen apps
const getSnapshot = (): boolean =>
  window.matchMedia(STANDALONE_QUERY).matches || navigator.standalone === true;

const getServerSnapshot = (): boolean => false;

export const useIsStandalone = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
