import { Resolvers } from '../../../../../graphql-rest.page.generated';

const AdminDeleteOrganizationUserResolvers: Resolvers = {
  Mutation: {
    adminDeleteOrganizationUser: async (
      _source,
      { input: { accountListId, userId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.adminDeleteOrganizationUser(
        accountListId,
        userId,
      );
    },
  },
};

export { AdminDeleteOrganizationUserResolvers };
