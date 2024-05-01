import { Resolvers } from '../../../../graphql-rest.page.generated';

const SearchOrganizationsAccountListsResolvers: Resolvers = {
  Query: {
    searchOrganizationsAccountLists: async (
      _source,
      { input: { organizationId, search, pageNumber } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.searchOrganizationsAccountLists(
        search,
        pageNumber || 1,
        organizationId || '',
      );
    },
  },
};

export { SearchOrganizationsAccountListsResolvers };
