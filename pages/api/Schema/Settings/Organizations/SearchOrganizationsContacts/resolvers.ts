import { Resolvers } from '../../../../graphql-rest.page.generated';

const SearchOrganizationsContactsResolvers: Resolvers = {
  Query: {
    searchOrganizationsContacts: async (
      _source,
      { input: { organizationId, search, pageNumber } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.searchOrganizationsContacts(
        organizationId,
        search,
        pageNumber || 1,
      );
    },
  },
};

export { SearchOrganizationsContactsResolvers };
