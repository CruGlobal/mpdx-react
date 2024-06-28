import { Resolvers } from '../../graphql-rest.page.generated';

const MergeContactsResolvers: Resolvers = {
  Mutation: {
    mergeContacts: (
      _source,
      { input: { loserContactIds, winnerContactId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.mergeContacts(
        loserContactIds,
        winnerContactId,
      );
    },
  },
};

export { MergeContactsResolvers };
