import { InMemoryCache } from '@apollo/client';
import generatedIntrospection from '../../graphql/possibleTypes.generated';
import { relayStylePaginationWithNodes } from './relayStylePaginationWithNodes';

const ignoredKeyArgsForPagination = ['before', 'after'];
const paginationFieldPolicy = relayStylePaginationWithNodes((args) =>
  args
    ? Object.keys(args).filter(
        (arg) => !ignoredKeyArgsForPagination.includes(arg),
      )
    : undefined,
);

export const createCache = () =>
  new InMemoryCache({
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
      // Disable cache normalization for tags because a tag like { id: 'abc', count: 3 } in one period should not be
      // merged with a tag like { id: 'def', count 2 } in another period
      Tag: { keyFields: false },
      Query: {
        fields: {
          contacts: paginationFieldPolicy,
          donations: paginationFieldPolicy,
          tasks: paginationFieldPolicy,
          userNotifications: paginationFieldPolicy,
        },
      },
    },
  });
