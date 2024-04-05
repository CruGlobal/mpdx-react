import { Resolvers } from '../../../../graphql-rest.page.generated';

const exportDataResolvers: Resolvers = {
  Mutation: {
    exportData: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.exportData(accountListId);
    },
  },
};

export { exportDataResolvers };
