import { ApolloClient, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { signOut } from 'next-auth/react';
import { clearDataDogUser } from 'src/hooks/useDataDog';
import snackNotifications from '../../components/Snackbar/Snackbar';
import { dispatch } from '../analytics';
import { createCache } from './cache';
import { batchLink, makeAuthLink } from './link';

const cache = createCache();
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });
}

const clientErrorLink = onError(({ graphQLErrors, networkError }) => {
  // Don't show sign out and display errors on the login page because the user won't be logged in
  if (graphQLErrors && window.location.pathname !== '/login') {
    graphQLErrors.map(({ message, extensions }) => {
      if (extensions?.code === 'AUTHENTICATION_ERROR') {
        signOut({ redirect: true, callbackUrl: 'signOut' }).then(() => {
          clearDataDogUser();
        });
      }
      snackNotifications.error(message);
    });
  }

  if (networkError) {
    dispatch('mpdx-api-error');
    snackNotifications.error(networkError.message);
  }
});

const makeClient = (apiToken: string) =>
  new ApolloClient({
    link: from([makeAuthLink(apiToken), clientErrorLink, batchLink]),
    cache,
    assumeImmutableResults: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
      },
    },
  });

export default makeClient;
