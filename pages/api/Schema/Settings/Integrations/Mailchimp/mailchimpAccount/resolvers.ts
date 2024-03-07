import { Resolvers } from '../../../../../graphql-rest.page.generated';

const MailchimpAccountResolvers: Resolvers = {
  Query: {
    mailchimpAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.mailchimpAccount(accountListId);
    },
  },
};

export { MailchimpAccountResolvers };
