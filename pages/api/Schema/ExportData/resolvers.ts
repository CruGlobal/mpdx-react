import { Resolvers } from '../../graphql-rest.page.generated';

const ExportDataResolvers: Resolvers = {
  Query: {
    getExportData: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getExportData(accountListId);
    },
  },
};

export { ExportDataResolvers };
