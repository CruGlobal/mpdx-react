import router from 'next/router';
import { ApolloClient, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
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

const cache = createCache();
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });
}

const makeClient = (apiToken: string) => {
  const client = new ApolloClient({
    link: from([
      makeAuthLink(apiToken),
      onError(({ graphQLErrors, networkError }) => {
        graphQLErrors?.forEach((graphQLError) => {
          if (graphQLError.extensions.code === 'AUTHENTICATION_ERROR') {
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
          } else {
            snackNotifications.error(graphQLError.message);
          }
        });

        if (networkError) {
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
