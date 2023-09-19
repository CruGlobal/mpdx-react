import { Resolvers } from '../../../../../graphql-rest.page.generated';

const CreateOrganizationInviteResolvers: Resolvers = {
  Mutation: {
    createOrganizationInvite: async (
      _source,
      { input: { organizationId, recipientEmail } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.createOrganizationInvite(
        organizationId,
        recipientEmail,
      );
    },
  },
};

export { CreateOrganizationInviteResolvers };
