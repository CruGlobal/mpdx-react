import { FieldMergeFunction, InMemoryCache } from '@apollo/client';
import { uniqBy } from 'lodash';
import generatedIntrospection from 'src/graphql/possibleTypes.generated';
import { relayStylePaginationWithNodes } from './relayStylePaginationWithNodes';

const ignoredKeyArgsForPagination = ['before', 'after'];
const paginationFieldPolicy = relayStylePaginationWithNodes((args) =>
  args
    ? Object.keys(args).filter(
        (arg) => !ignoredKeyArgsForPagination.includes(arg),
      )
    : undefined,
);
const mergePages: FieldMergeFunction = (existing = [], incoming) =>
  uniqBy([...existing, ...incoming], '__ref');

export const createCache = () =>
  new InMemoryCache({
    possibleTypes: generatedIntrospection.possibleTypes,
    typePolicies: {
      Appeal: {
        fields: {
          pledges: paginationFieldPolicy,
        },
        merge: true,
      },
      CoachingAppeal: {
        fields: {
          pledges: paginationFieldPolicy,
        },
        merge: true,
      },
      AccountList: {
        fields: {
          contacts: paginationFieldPolicy,
        },
        merge: true,
      },
      CoachingAccountList: {
        fields: {
          contacts: paginationFieldPolicy,
        },
        merge: true,
      },
      User: { merge: true },
      Contact: {
        fields: {
          contactReferralsByMe: paginationFieldPolicy,
          donations: paginationFieldPolicy,
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
      // Disable cache normalization for 14 month report contacts because a contact in one currency group should not be
      // merged a contact with the same id in a different currency group
      FourteenMonthReportContact: { keyFields: false },
      // Disable cache normalization for tags because a tag like { id: 'abc', count: 3 } in one period should not be
      // merged with a tag like { id: 'def', count 2 } in another period
      Tag: { keyFields: false },
      Query: {
        fields: {
          contacts: paginationFieldPolicy,
          donations: paginationFieldPolicy,
          financialAccounts: paginationFieldPolicy,
          people: paginationFieldPolicy,
          tasks: paginationFieldPolicy,
          userNotifications: paginationFieldPolicy,
          // Ignore the input.pageNumber arg so that queries with different page numbers will
          // be merged together
          searchOrganizationsAccountLists: {
            keyArgs: ['input', ['organizationId', 'search']],
          },
          searchOrganizationsContacts: {
            keyArgs: ['input', ['organizationId', 'search']],
          },
        },
      },
    },
  });
