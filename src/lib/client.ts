import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import fetch from 'isomorphic-fetch';
import { signOut } from 'next-auth/react';
import { clearDataDogUser } from 'src/hooks/useDataDog';
import generatedIntrospection from '../../graphql/possibleTypes.generated';
import snackNotifications from '../components/Snackbar/Snackbar';
import { dispatch } from './analytics';
import { relayStylePaginationWithNodes } from './relayStylePaginationWithNodes';

const ignoredkeyArgsForPagination = ['before', 'after'];
const paginationFieldPolicy = relayStylePaginationWithNodes((args) =>
  args
    ? Object.keys(args).filter(
        (arg) => !ignoredkeyArgsForPagination.includes(arg),
      )
    : undefined,
);

const paginationForOrganizationQueries = (name) => {
  return {
    keyArgs: ['input', ['search', 'organizationId']],
    merge(existing = [] as any, incoming) {
      const merged = existing ? { ...existing } : {};
      merged.pagination = incoming.pagination;
      const accountLists = existing[name] || [];
      merged[name] = accountLists.concat(incoming[name]);
      return merged;
    },
  };
};

export const cache = new InMemoryCache({
  possibleTypes: generatedIntrospection.possibleTypes,
  typePolicies: {
    AccountList: { merge: true },
    User: { merge: true },
    Contact: {
      fields: {
        contactReferralsByMe: paginationFieldPolicy,
      },
      merge: true,
    },
    Query: {
      fields: {
        contacts: paginationFieldPolicy,
        donations: paginationFieldPolicy,
        tasks: paginationFieldPolicy,
        userNotifications: paginationFieldPolicy,
        searchOrganizationsContacts:
          paginationForOrganizationQueries('contacts'),
        searchOrganizationsAccountLists:
          paginationForOrganizationQueries('accountLists'),
      },
    },
  },
});

const httpLink = new BatchHttpLink({
  uri: `${process.env.SITE_URL}/api/graphql`,
  batchMax: 25,
  batchDebounce: true,
  batchInterval: 20,
  fetch,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
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
  link: errorLink.concat(httpLink),
  cache,
  assumeImmutableResults: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  },
});

export const ssrClient = (
  apiToken?: string,
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({
    uri: process.env.API_URL,
    fetch,
    headers: {
      Authorization: apiToken ? `Bearer ${apiToken}` : null,
      Accept: 'application/json',
    },
  });

  return new ApolloClient({
    link: errorLink.concat(httpLink),
    ssrMode: true,
    assumeImmutableResults: true,
    cache: new InMemoryCache({
      possibleTypes: generatedIntrospection.possibleTypes,
    }),
  });
};

export default client;
