import { Resolvers } from 'pages/api/graphql-rest.page.generated';

const canUserExportDataResolvers: Resolvers = {
  Query: {
    canUserExportData: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.canUserExportData(accountListId);
    },
  },
};

export { canUserExportDataResolvers };
