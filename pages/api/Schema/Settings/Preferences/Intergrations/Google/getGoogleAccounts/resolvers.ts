import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const GetGoogleAccountsResolvers: Resolvers = {
  Query: {
    getGoogleAccounts: async (_source, {}, { dataSources }) => {
      return dataSources.mpdxRestApi.getGoogleAccounts();
    },
  },
};

export { GetGoogleAccountsResolvers };
