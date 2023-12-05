import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const GoogleAccountIntegrationsResolvers: Resolvers = {
  Query: {
    googleAccountIntegrations: async (
      _source,
      { input: { googleAccountId, accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.googleAccountIntegrations(
        googleAccountId,
        accountListId,
      );
    },
  },
};

export { GoogleAccountIntegrationsResolvers };
