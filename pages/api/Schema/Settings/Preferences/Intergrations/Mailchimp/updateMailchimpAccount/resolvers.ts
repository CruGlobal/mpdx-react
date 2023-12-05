import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const UpdateMailchimpAccountResolvers: Resolvers = {
  Mutation: {
    updateMailchimpAccount: async (
      _source,
      { input: { accountListId, mailchimpAccountId, mailchimpAccount } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.updateMailchimpAccount(
        accountListId,
        mailchimpAccountId,
        mailchimpAccount,
      );
    },
  },
};

export { UpdateMailchimpAccountResolvers };
