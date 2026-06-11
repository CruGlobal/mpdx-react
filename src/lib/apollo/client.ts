import router from 'next/router';
import { ApolloClient, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  GetDefaultAccountDocument,
  GetDefaultAccountQuery,
} from 'pages/api/getDefaultAccount.generated';
import snackNotifications from '../../components/Snackbar/Snackbar';
import { dispatch } from '../analytics';
import {
  isAccountListNotFoundError,
  replaceUrlAccountList,
} from './accountListRedirect';
import { cache, cachePersistor } from './cachePersistor';
import { handleAuthenticationError } from './handleAuthenticationError';
import { batchLink, makeAuthLink } from './link';
import { isOffline, offlineLink } from './offlineLink';

// Re-exported for existing consumers that import the persistor from this module.
export { cachePersistor };

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
            // Runs logoutCleanup to completion BEFORE the signOut redirect so
            // the cleanup cannot race the page unload, and coalesces
            // concurrent authentication errors into one cleanup + signOut.
            handleAuthenticationError(client);
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
        // Keep rendering cached data when the network leg fails (e.g.
        // offline) instead of discarding data on the error emission
        errorPolicy: 'all',
      },
    },
  });
  return client;
};

export default makeClient;
