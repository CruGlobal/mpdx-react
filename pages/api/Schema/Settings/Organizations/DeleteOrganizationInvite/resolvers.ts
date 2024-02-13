import { Resolvers } from '../../../../graphql-rest.page.generated';

const DeleteOrganizationInviteResolvers: Resolvers = {
  Mutation: {
    destroyOrganizationInvite: async (
      _source,
      { input: { organizationId, inviteId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.destroyOrganizationInvite(
        organizationId,
        inviteId,
      );
    },
  },
};

export { DeleteOrganizationInviteResolvers };
