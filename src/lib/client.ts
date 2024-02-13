import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { signOut } from 'next-auth/react';
import generatedIntrospection from 'src/graphql/possibleTypes.generated';
import { clearDataDogUser } from 'src/hooks/useDataDog';
import snackNotifications from '../components/Snackbar/Snackbar';
import { dispatch } from './analytics';
import { createCache } from './apolloCache';

const cache = createCache();

const batchHttpLink = new BatchHttpLink({
  uri: `${process.env.SITE_URL}/api/graphql`,
  batchMax: 25,
  batchDebounce: true,
  batchInterval: 20,
  fetch,
});

// link to use if not batching
const httpLink = createHttpLink({
  uri: `${process.env.SITE_URL}/api/graphql`,
  fetch,
});

const batchLink = split(
  (operation) => operation.getContext().doNotBatch === true,
  httpLink,
  batchHttpLink,
);

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

if (process.browser && process.env.NODE_ENV === 'production') {
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });
}

const client = new ApolloClient({
  link: clientErrorLink.concat(batchLink),
  cache,
  assumeImmutableResults: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  },
});

export default client;
