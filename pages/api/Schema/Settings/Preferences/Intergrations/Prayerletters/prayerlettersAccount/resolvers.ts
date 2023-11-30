import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const PrayerlettersAccountResolvers: Resolvers = {
  Query: {
    prayerlettersAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.prayerlettersAccount(accountListId);
    },
  },
};

export { PrayerlettersAccountResolvers };
