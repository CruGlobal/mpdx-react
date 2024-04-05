import { Resolvers } from '../../../../../graphql-rest.page.generated';

const SyncMailchimpAccountResolvers: Resolvers = {
  Mutation: {
    syncMailchimpAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.syncMailchimpAccount(accountListId);
    },
  },
};

export { SyncMailchimpAccountResolvers };
