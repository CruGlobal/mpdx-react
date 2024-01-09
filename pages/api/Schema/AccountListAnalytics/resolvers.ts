import { Resolvers } from '../../graphql-rest.page.generated';

/**
 * This will work with both accountList and CoachingAccountList Ids.
 */
const AccountListAnalyticsResolvers: Resolvers = {
  Query: {
    accountListAnalytics: async (
      _source,
      { accountListId, dateRange },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getAccountListAnalytics(
        accountListId,
        dateRange,
      );
    },
  },
};

export { AccountListAnalyticsResolvers };
