import { Resolvers } from '../../../../../graphql-rest.page.generated';

const GoogleAccountsResolvers: Resolvers = {
  Query: {
    googleAccounts: async (_source, {}, { dataSources }) => {
      return dataSources.mpdxRestApi.googleAccounts();
    },
  },
};

export { GoogleAccountsResolvers };
