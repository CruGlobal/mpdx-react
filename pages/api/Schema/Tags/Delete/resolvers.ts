import { Resolvers } from '../../../graphql-rest.page.generated';

export const DeleteTagsResolvers: Resolvers = {
  Mutation: {
    deleteTags: (_source, { input: { tagName, page } }, { dataSources }) => {
      return dataSources.mpdxRestApi.deleteTags(tagName, page);
    },
  },
};
