import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import fetch from 'isomorphic-fetch';
import generatedIntrospection from '../../graphql/possibleTypes.generated';
import snackNotifications from '../components/Snackbar/Snackbar';

export const cache = new InMemoryCache({
  possibleTypes: generatedIntrospection.possibleTypes,
  typePolicies: {
    Query: {
      fields: {
        userNotifications: relayStylePagination(['accountListId']),
      },
    },
  },
});

const httpLink = createHttpLink({
  uri: `${process.env.SITE_URL}/api/graphql`,
  fetch,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message }) => snackNotifications.error(message));
  }

  if (networkError) snackNotifications.error(networkError.message);
});

if (process.browser && process.env.NODE_ENV === 'production') {
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });
}

const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache,
});

export const ssrClient = (
  token?: string,
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({
    uri: process.env.API_URL,
    fetch,
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
      Accept: 'application/json',
    },
  });

  return new ApolloClient({
    link: errorLink.concat(httpLink),
    ssrMode: true,
    cache: new InMemoryCache({
      possibleTypes: generatedIntrospection.possibleTypes,
    }),
    defaultOptions: {
      watchQuery: {
        notifyOnNetworkStatusChange: true,
      },
    },
  });
};

export default client;
