import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const SyncPrayerlettersAccountResolvers: Resolvers = {
  Mutation: {
    syncPrayerlettersAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.syncPrayerlettersAccount(accountListId);
    },
  },
};

export { SyncPrayerlettersAccountResolvers };
