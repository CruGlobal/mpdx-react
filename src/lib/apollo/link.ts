import { ApolloLink, Operation, createHttpLink, split } from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { Kind } from 'graphql';
import { rootFields } from 'src/graphql/rootFields.generated';

const nativeFields = new Set(rootFields);

const nativeHttpLink = createHttpLink({
  uri: process.env.API_URL,
  headers: {
    'Content-Type': 'application/vnd.api+json',
  },
});

const batchNativeHttpLink = new BatchHttpLink({
  uri: process.env.API_URL,
  headers: {
    'Content-Type': 'application/vnd.api+json',
  },
  batchMax: 25,
  batchDebounce: true,
  batchInterval: 20,
});

const restProxyHttpLink = new BatchHttpLink({
  uri: `${process.env.SITE_URL}/api/graphql-rest`,
  batchMax: 25,
  batchDebounce: true,
  batchInterval: 20,
});

// Return true if the operation can be satisfied by the native GraphQL API (not the REST proxy)
export const isNativeOperation = (operation: Operation): boolean =>
  operation.query.definitions.every(
    (definition) =>
      definition.kind !== Kind.OPERATION_DEFINITION ||
      definition.selectionSet.selections.every(
        (selection) =>
          selection.kind !== Kind.FIELD ||
          nativeFields.has(selection.name.value),
      ),
  );

export const batchLink = split(
  (operation) => isNativeOperation(operation),
  split(
    (operation) => operation.getContext().doNotBatch === true,
    nativeHttpLink,
    batchNativeHttpLink,
  ),
  restProxyHttpLink,
);

export const makeAuthLink = (apiToken: string) =>
  new ApolloLink((operation, forward) => {
    operation.setContext(({ headers }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${apiToken}`,
        // We pass through a empty Accept-Language header to the API to avoid it defaulting to 'en-US'
        // The API uses this header to determine the language of the response
        // if there is no header it goes off the user's account settings, which is what we want.
        'Accept-Language': '',
      },
    }));
    return forward(operation);
  });
