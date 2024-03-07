import { Resolvers } from '../../../../../graphql-rest.page.generated';

const DeleteGoogleAccountResolvers: Resolvers = {
  Mutation: {
    deleteGoogleAccount: async (
      _source,
      { input: { accountId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.deleteGoogleAccount(accountId);
    },
  },
};

export { DeleteGoogleAccountResolvers };
