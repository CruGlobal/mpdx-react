import { Resolvers } from '../../../../../graphql-rest.page.generated';

const OrganizationAdminsResolvers: Resolvers = {
  Query: {
    organizationAdmins: async (
      _source,
      { input: { organizationId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.organizationAdmins(organizationId);
    },
  },
};

export { OrganizationAdminsResolvers };
