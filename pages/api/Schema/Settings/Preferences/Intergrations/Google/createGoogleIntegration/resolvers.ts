import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const CreateGoogleIntegrationResolvers: Resolvers = {
  Mutation: {
    createGoogleIntegration: async (
      _source,
      { input: { googleAccountId, googleIntegration, accountListID } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.createGoogleIntegration(
        googleAccountId,
        googleIntegration,
        accountListID,
      );
    },
  },
};

export { CreateGoogleIntegrationResolvers };
