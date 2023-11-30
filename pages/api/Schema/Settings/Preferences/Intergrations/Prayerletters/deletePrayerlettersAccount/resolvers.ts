import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const DeletePrayerlettersAccountResolvers: Resolvers = {
  Mutation: {
    deletePrayerlettersAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.deletePrayerlettersAccount(accountListId);
    },
  },
};

export { DeletePrayerlettersAccountResolvers };
