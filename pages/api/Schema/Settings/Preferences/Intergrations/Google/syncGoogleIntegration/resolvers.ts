import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const SyncGoogleIntegrationResolvers: Resolvers = {
  Query: {
    syncGoogleIntegration: async (
      _source,
      { input: { googleAccountId, googleIntegrationId, integrationName } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.syncGoogleIntegration(
        googleAccountId,
        googleIntegrationId,
        integrationName,
      );
    },
  },
};

export { SyncGoogleIntegrationResolvers };
