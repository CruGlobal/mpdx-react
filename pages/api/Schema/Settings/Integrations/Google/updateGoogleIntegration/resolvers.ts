import { Resolvers } from '../../../../../graphql-rest.page.generated';

const UpdateGoogleIntegrationResolvers: Resolvers = {
  Mutation: {
    updateGoogleIntegration: async (
      _source,
      { input: { googleAccountId, googleIntegrationId, googleIntegration } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.updateGoogleIntegration(
        googleAccountId,
        googleIntegrationId,
        googleIntegration,
      );
    },
  },
};

export { UpdateGoogleIntegrationResolvers };
