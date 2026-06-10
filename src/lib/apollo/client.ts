import router from 'next/router';
import { ApolloClient, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { CachePersistor, LocalForageWrapper } from 'apollo3-cache-persist';
import localforage from 'localforage';
import { signOut } from 'next-auth/react';
import {
  GetDefaultAccountDocument,
  GetDefaultAccountQuery,
} from 'pages/api/getDefaultAccount.generated';
import { clearDataDogUser } from 'src/lib/dataDog';
import snackNotifications from '../../components/Snackbar/Snackbar';
import { dispatch } from '../analytics';
import {
  isAccountListNotFoundError,
  replaceUrlAccountList,
} from './accountListRedirect';
import { createCache } from './cache';
import { batchLink, makeAuthLink } from './link';
import { isOffline, offlineLink } from './offlineLink';

const cache = createCache();

// CachePersistor (rather than persistCache) gives logout a handle to purge
// the persisted data. IndexedDB via localforage avoids localStorage's ~5MB
// cap, which a cached contact list can exceed.
export const cachePersistor =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? new CachePersistor({
        cache,
        storage: new LocalForageWrapper(localforage),
        maxSize: false,
      })
    : undefined;

if (cachePersistor) {
  await cachePersistor.restore();
  // Remove the cache persisted to localStorage by the previous implementation
  window.localStorage.removeItem('apollo-cache-persist');
}

const makeClient = (apiToken: string) => {
  const client = new ApolloClient({
    link: from([
      offlineLink,
      makeAuthLink(apiToken),
      onError(({ graphQLErrors, networkError, operation }) => {
        const suppressErrors = operation.getContext().suppressErrors === true;

        graphQLErrors?.forEach((graphQLError) => {
          if (graphQLError?.extensions?.code === 'AUTHENTICATION_ERROR') {
            signOut({ redirect: true, callbackUrl: 'signOut' }).then(() => {
              clearDataDogUser();
              client.clearStore();
            });
          }
          if (isAccountListNotFoundError(graphQLError)) {
            client
              .query<GetDefaultAccountQuery>({
                query: GetDefaultAccountDocument,
              })
              .then((response) => {
                // eslint-disable-next-line no-console
                console.log('Incorrect accountListId provided. Redirecting.');
                router.replace(
                  replaceUrlAccountList(
                    window.location.pathname,
                    response.data.user.defaultAccountList,
                  ),
                );
              });
          } else if (!suppressErrors) {
            snackNotifications.error(graphQLError.message);
          }
        });

        if (networkError && !isOffline()) {
          dispatch('mpdx-api-error');
          snackNotifications.error(networkError.message);
        }
      }),
      batchLink,
    ]),
    cache,
    assumeImmutableResults: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
      },
    },
  });
  return client;
};

export default makeClient;
