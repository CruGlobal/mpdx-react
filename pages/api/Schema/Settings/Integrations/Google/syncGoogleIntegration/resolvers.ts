import { Resolvers } from '../../../../../graphql-rest.page.generated';

const SyncGoogleIntegrationResolvers: Resolvers = {
  Mutation: {
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
