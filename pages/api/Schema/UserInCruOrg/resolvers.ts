import { Resolvers } from '../../graphql-rest.page.generated';

const UserInCruOrgResolvers: Resolvers = {
  Query: {
    getUserInCruOrg: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getUserInCruOrg(accountListId);
    },
  },
};

export { UserInCruOrgResolvers };
