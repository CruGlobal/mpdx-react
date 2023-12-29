import {
  ApolloClient,
  FieldMergeFunction,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
  split,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import fetch from 'isomorphic-fetch';
import { uniqBy } from 'lodash';
import { signOut } from 'next-auth/react';
import generatedIntrospection from 'src/graphql/possibleTypes.generated';
import { clearDataDogUser } from 'src/hooks/useDataDog';
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

const mergePages: FieldMergeFunction = (existing = [], incoming) =>
  uniqBy([...existing, ...incoming], '__ref');

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
    SearchOrganizationsAccountListsResponse: {
      fields: {
        accountLists: {
          merge: mergePages,
        },
      },
    },
    SearchOrganizationsContactsResponse: {
      fields: {
        contacts: {
          merge: mergePages,
        },
      },
    },
    Query: {
      fields: {
        contacts: paginationFieldPolicy,
        donations: paginationFieldPolicy,
        // Ignore the input.pageNumber arg so that queries with different page numbers will
        // be merged together
        searchOrganizationsAccountLists: {
          keyArgs: ['input', ['organizationId', 'search']],
        },
        searchOrganizationsContacts: {
          keyArgs: ['input', ['organizationId', 'search']],
        },
        tasks: paginationFieldPolicy,
        userNotifications: paginationFieldPolicy,
      },
    },
  },
});

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

const serverErrorLink = onError(({ graphQLErrors, networkError }) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Rollbar = require('rollbar');
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
    environment: 'react_development_server',
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  if (graphQLErrors) {
    graphQLErrors.map(({ message, extensions }) => {
      rollbar.error(message, extensions);
    });
  }

  if (networkError) {
    rollbar.error(networkError);
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
    link: serverErrorLink.concat(httpLink),
    ssrMode: true,
    assumeImmutableResults: true,
    cache: new InMemoryCache({
      possibleTypes: generatedIntrospection.possibleTypes,
    }),
  });
};

export default client;
