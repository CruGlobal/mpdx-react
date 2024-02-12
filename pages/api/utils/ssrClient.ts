import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import fetch from 'isomorphic-fetch';
import rollbar, { isRollBarEnabled } from 'pages/api/utils/rollBar';
import generatedIntrospection from 'src/graphql/possibleTypes.generated';

const serverErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors && isRollBarEnabled) {
    graphQLErrors.map(({ message, extensions }) => {
      rollbar.error(message, extensions);
    });
  }

  if (networkError && isRollBarEnabled) {
    rollbar.error(networkError);
  }
});

const makeSsrClient = (
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

export default makeSsrClient;
