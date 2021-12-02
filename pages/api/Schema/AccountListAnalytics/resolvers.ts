import { Resolvers } from 'pages/api/graphql-rest.page.generated';

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
