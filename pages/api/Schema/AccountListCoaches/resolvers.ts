import { Resolvers } from '../../graphql-rest.page.generated';

const AccountListCoachesResolvers: Resolvers = {
  Query: {
    getAccountListCoaches: async (_source, {}, { dataSources }) => {
      return dataSources.mpdxRestApi.getAccountListCoaches();
    },
  },
};

export { AccountListCoachesResolvers };
