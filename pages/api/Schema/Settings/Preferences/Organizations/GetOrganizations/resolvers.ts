import { Resolvers } from '../../../../../graphql-rest.page.generated';

const GetOrganizationsResolvers: Resolvers = {
  Query: {
    getOrganizations: async (_source, {}, { dataSources }) => {
      return dataSources.mpdxRestApi.getOrganizations();
    },
  },
};

export { GetOrganizationsResolvers };
