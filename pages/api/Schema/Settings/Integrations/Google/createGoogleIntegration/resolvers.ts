import { Resolvers } from '../../../../../graphql-rest.page.generated';

const CreateGoogleIntegrationResolvers: Resolvers = {
  Mutation: {
    createGoogleIntegration: async (
      _source,
      { input: { googleAccountId, googleIntegration, accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.createGoogleIntegration(
        googleAccountId,
        googleIntegration,
        accountListId,
      );
    },
  },
};

export { CreateGoogleIntegrationResolvers };
