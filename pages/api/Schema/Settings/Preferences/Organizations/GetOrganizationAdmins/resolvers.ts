import { Resolvers } from '../../../../../graphql-rest.page.generated';

const GetOrganizationAdminsResolvers: Resolvers = {
  Query: {
    getOrganizationAdmins: async (
      _source,
      { input: { organizationId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getOrganizationAdmins(organizationId);
    },
  },
};

export { GetOrganizationAdminsResolvers };
