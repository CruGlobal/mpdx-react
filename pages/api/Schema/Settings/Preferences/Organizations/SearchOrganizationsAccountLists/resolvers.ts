import { Resolvers } from '../../../../../graphql-rest.page.generated';

const SearchOrganizationsAccountListsResolvers: Resolvers = {
  Query: {
    searchOrganizationsAccountLists: async (
      _source,
      { input: { organizationId, search, pageNumber } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.searchOrganizationsAccountLists(
        organizationId,
        search,
        pageNumber || 1,
      );
    },
  },
};

export { SearchOrganizationsAccountListsResolvers };
