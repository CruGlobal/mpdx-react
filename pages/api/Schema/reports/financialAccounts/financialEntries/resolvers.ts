import { Resolvers } from '../../../../graphql-rest.page.generated';

export const financialAccountEntriesResolvers: Resolvers = {
  Query: {
    financialAccountEntries: (
      _source,
      {
        input: {
          accountListId,
          financialAccountId,
          dateRange,
          categoryId,
          wildcardSearch,
        },
      },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.financialAccountEntries(
        accountListId,
        financialAccountId,
        dateRange,
        categoryId,
        wildcardSearch,
      );
    },
  },
};
