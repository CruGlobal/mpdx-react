import { Resolvers } from '../../graphql-rest.page.generated';

const MergeContactsResolvers: Resolvers = {
  Mutation: {
    mergeContacts: (
      _source,
      { input: { winnersAndLosers } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.mergeContacts(winnersAndLosers);
    },
  },
};

export { MergeContactsResolvers };
