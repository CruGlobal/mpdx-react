import { Resolvers } from '../../../../../graphql-rest.page.generated';

const OrganizationsResolvers: Resolvers = {
  Query: {
    getOrganizations: async (_source, {}, { dataSources }) => {
      return dataSources.mpdxRestApi.organizations();
    },
  },
};

export { OrganizationsResolvers };
