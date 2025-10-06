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
      // There is only one Constant entity, so merge all of them
      Constant: { keyFields: [] },
      // For Options, use the key as the unique id to make it easier to find them in the cache
      Option: { keyFields: ['key'] },
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
      PrimaryBudgetCategory: {
        fields: {
          // Always overwrite the existing sub budget categories with the incoming categories
          subBudgetCategories: { merge: false },
        },
      },
      // Disable cache normalization for 12 month report contacts because a contact in one currency group should not be
      // merged a contact with the same id in a different currency group
      FourteenMonthReportContact: { keyFields: false },
      // Disable cache normalization for tags because a tag like { id: 'abc', count: 3 } in one period should not be
      // merged with a tag like { id: 'def', count 2 } in another period
      Tag: { keyFields: false },
      Query: {
        fields: {
          accountListPledges: paginationFieldPolicy,
          appeals: paginationFieldPolicy,
          coachingAccountListPledges: paginationFieldPolicy,
          coachingAccountLists: paginationFieldPolicy,
          contacts: paginationFieldPolicy,
          donations: paginationFieldPolicy,
          financialAccounts: paginationFieldPolicy,
          people: paginationFieldPolicy,
          tasks: paginationFieldPolicy,
          userNotifications: paginationFieldPolicy,
          // When loading a user option, look it up from the cache by its key
          userOption: {
            read: (_, { args, toReference }) =>
              args &&
              toReference({
                __typename: 'Option',
                key: args.key,
              }),
          },
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
