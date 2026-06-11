import { ApolloClient } from '@apollo/client';
import { cachePersistor } from './cachePersistor';

// Removes all locally-stored Apollo data. Must run on EVERY path that ends a
// session: the persisted IndexedDB cache outlives logout otherwise, exposing
// the previous user's data on shared devices. New signout paths must call
// logoutCleanup() (src/lib/auth/logoutCleanup.ts), which wraps this with
// push-device unregistration (which must happen BEFORE clearStore, while the
// token is still valid), CacheStorage clearing, and DataDog user clearing.
// pause() stops the persistor's debounced write trigger so an in-flight
// write cannot re-persist data after the purge.
export const clearApolloData = async (
  client: ApolloClient<object>,
): Promise<void> => {
  cachePersistor?.pause();
  await client.clearStore();
  await cachePersistor?.purge();
};
