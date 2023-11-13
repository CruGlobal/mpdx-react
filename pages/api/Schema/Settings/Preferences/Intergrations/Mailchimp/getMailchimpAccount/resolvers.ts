import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const GetMailchimpAccountResolvers: Resolvers = {
  Query: {
    getMailchimpAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getMailchimpAccount(accountListId);
    },
  },
};

export { GetMailchimpAccountResolvers };
