import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const DeleteMailchimpAccountResolvers: Resolvers = {
  Mutation: {
    deleteMailchimpAccount: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.deleteMailchimpAccount(accountListId);
    },
  },
};

export { DeleteMailchimpAccountResolvers };
