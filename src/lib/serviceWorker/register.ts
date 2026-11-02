import { Serwist } from '@serwist/window';

let serwist: Serwist | undefined;

export const registerServiceWorker = (): Serwist | undefined => {
  if (serwist) {
    return serwist;
  }
  if (
    process.env.NODE_ENV !== 'production' ||
    !('serviceWorker' in navigator)
  ) {
    return undefined;
  }

  serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });
  // A failed registration (404, blocked by policy) must not reach Rollbar as an unhandled rejection
  serwist.register().catch(() => {});
  return serwist;
};
