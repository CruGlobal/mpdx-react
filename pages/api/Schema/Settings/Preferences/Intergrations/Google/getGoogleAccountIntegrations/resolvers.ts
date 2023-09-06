import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const GetGoogleAccountIntegrationsResolvers: Resolvers = {
  Query: {
    getGoogleAccountIntegrations: async (
      _source,
      { input: { googleAccountId, accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getGoogleAccountIntegrations(
        googleAccountId,
        accountListId,
      );
    },
  },
};

export { GetGoogleAccountIntegrationsResolvers };
