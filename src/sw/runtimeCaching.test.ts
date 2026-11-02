import { ExpirationPlugin, NetworkOnly, StaleWhileRevalidate } from 'serwist';
import { TRANSLATIONS_CACHE } from 'src/lib/serviceWorker/cacheNames';
import { isNetworkOnly } from './networkOnly';
import { runtimeCaching } from './runtimeCaching';
import { isTranslationFile } from './translations';

// serwist is ESM-only and Jest does not transform node_modules
jest.mock('serwist', () => {
  class WithOptions {
    constructor(public options: unknown) {}
  }
  return {
    NetworkOnly: class NetworkOnly {},
    StaleWhileRevalidate: class StaleWhileRevalidate extends WithOptions {},
    ExpirationPlugin: class ExpirationPlugin extends WithOptions {},
  };
});

describe('runtimeCaching', () => {
  it('puts the network-only rule first', () => {
    expect(runtimeCaching[0].matcher).toBe(isNetworkOnly);
    expect(runtimeCaching[0].handler).toBeInstanceOf(NetworkOnly);
  });

  it('caches translation files in their own small cache', () => {
    const { matcher, handler } = runtimeCaching[1];
    expect(matcher).toBe(isTranslationFile);
    expect(handler).toBeInstanceOf(StaleWhileRevalidate);
    expect(handler).toMatchObject({
      options: {
        cacheName: TRANSLATIONS_CACHE,
        plugins: [
          expect.objectContaining({
            constructor: ExpirationPlugin,
            options: { maxEntries: 5 },
          }),
        ],
      },
    });
  });
});
