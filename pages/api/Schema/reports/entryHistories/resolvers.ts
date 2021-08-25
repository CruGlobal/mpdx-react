import { Resolvers } from '../../../graphql-rest.page.generated';

export const EntryHistoriesResolvers: Resolvers = {
  Query: {
    entryHistories: (
      _source,
      { accountListId, financialAccountIds },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getEntryHistories(
        accountListId,
        financialAccountIds,
      );
    },
  },
};
