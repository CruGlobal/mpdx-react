import { CachePersistor, LocalForageWrapper } from 'apollo3-cache-persist';
import localforage from 'localforage';
import { createCache } from './cache';

export const cache = createCache();

// CachePersistor (rather than persistCache) gives logout a handle to purge
// the persisted data. IndexedDB via localforage avoids localStorage's ~5MB
// cap, which a cached contact list can exceed.
//
// This lives in its own module (separate from client.ts) so that
// clearApolloData and its consumers can reference the persistor without
// importing client.ts, which performs a top-level `await` that browsers and
// the app entry handle but the Jest CommonJS transform cannot.
export const cachePersistor =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? new CachePersistor({
        cache,
        storage: new LocalForageWrapper(localforage),
        maxSize: false,
      })
    : undefined;
