import { Resolvers } from '../../../../../../graphql-rest.page.generated';

const SendToChalklineResolvers: Resolvers = {
  Mutation: {
    sendToChalkline: async (
      _source,
      { input: { accountListId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.sendToChalkline(accountListId);
    },
  },
};

export { SendToChalklineResolvers };
