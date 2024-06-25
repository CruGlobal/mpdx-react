import { Resolvers } from '../../graphql-rest.page.generated';

const MergePeopleBulkResolvers: Resolvers = {
  Mutation: {
    mergePeopleBulk: (
      _source,
      { input: { winnersAndLosers } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.mergePeopleBulk(winnersAndLosers);
    },
  },
};

export { MergePeopleBulkResolvers };
