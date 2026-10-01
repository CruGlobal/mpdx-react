import { ApolloError } from '@apollo/client';
import Rollbar from 'rollbar';

/**
 * Rollbar `transform` that copies the GraphQL errors of an `ApolloError` into
 * the item's custom data, so the error's `extensions` are visible in Rollbar.
 */
export const addGraphQLErrorsToRollbarItem: NonNullable<
  Rollbar.Configuration['transform']
> = (data, item) => {
  const error = item.err;
  if (!(error instanceof ApolloError) || !error.graphQLErrors.length) {
    return;
  }

  data.custom = {
    ...(data.custom as Rollbar.Dictionary | undefined),
    graphQLErrors: error.graphQLErrors.map(({ message, path, extensions }) => ({
      message,
      path: path?.join('.'),
      extensions,
    })),
  };
};
