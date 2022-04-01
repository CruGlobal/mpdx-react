import { Resolvers } from '../../graphql-rest.page.generated';

const AccountListCoachUserResolvers: Resolvers = {
  Query: {
    getAccountListCoachUsers: async (
      _source,
      { accountListId },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getAccountListCoachUsers(accountListId);
    },
  },
};

export { AccountListCoachUserResolvers };
