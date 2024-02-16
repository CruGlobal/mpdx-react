import { Resolvers } from '../../../../graphql-rest.page.generated';

const AdminDeleteOrganizationInvitesResolvers: Resolvers = {
  Mutation: {
    adminDeleteOrganizationInvite: async (
      _source,
      { input: { accountListId, inviteId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.adminDeleteOrganizationInvite(
        accountListId,
        inviteId,
      );
    },
  },
};

export { AdminDeleteOrganizationInvitesResolvers };
