import { Resolvers } from '../../../../../graphql-rest.page.generated';

const GetOrganizationInvitesResolvers: Resolvers = {
  Query: {
    getOrganizationInvites: async (
      _source,
      { input: { organizationId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getOrganizationInvites(organizationId);
    },
  },
};

export { GetOrganizationInvitesResolvers };
