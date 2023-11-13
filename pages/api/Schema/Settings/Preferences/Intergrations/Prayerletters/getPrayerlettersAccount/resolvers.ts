import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const GetPrayerlettersAccountResolvers: Resolvers = {
  Query: {
    getPrayerlettersAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getPrayerlettersAccount(accountListId);
    },
  },
};

export { GetPrayerlettersAccountResolvers };
