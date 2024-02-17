import { Resolvers } from '../../../../graphql-rest.page.generated';

const OrganizationInvitesResolvers: Resolvers = {
  Query: {
    organizationInvites: async (
      _source,
      { input: { organizationId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.organizationInvites(organizationId);
    },
  },
};

export { OrganizationInvitesResolvers };
