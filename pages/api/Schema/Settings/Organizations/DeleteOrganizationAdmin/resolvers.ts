import { Resolvers } from '../../../../graphql-rest.page.generated';

const DeleteOrganizationAdminResolvers: Resolvers = {
  Mutation: {
    destroyOrganizationAdmin: async (
      _source,
      { input: { organizationId, adminId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.destroyOrganizationAdmin(
        organizationId,
        adminId,
      );
    },
  },
};

export { DeleteOrganizationAdminResolvers };
