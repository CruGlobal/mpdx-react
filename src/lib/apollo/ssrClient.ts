import {
  ApolloClient,
  type ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import rollbar, { isRollBarEnabled } from 'pages/api/utils/rollBar';
import generatedIntrospection from 'src/graphql/possibleTypes.generated';
import { batchLink, makeAuthLink } from './link';

const serverErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, extensions }) => {
      rollbar.error(message, extensions);
    });
  }

  if (networkError) {
    rollbar.error(networkError);
  }
});

const makeSsrClient = (
  apiToken: string | null,
): ApolloClient<NormalizedCacheObject> => {
  const links: ApolloLink[] = [];
  if (apiToken !== null) {
    links.push(makeAuthLink(apiToken));
  }
  if (isRollBarEnabled) {
    links.push(serverErrorLink);
  }
  links.push(batchLink);

  return new ApolloClient({
    link: from(links),
    ssrMode: true,
    assumeImmutableResults: true,
    cache: new InMemoryCache({
      possibleTypes: generatedIntrospection.possibleTypes,
    }),
  });
};

export default makeSsrClient;
