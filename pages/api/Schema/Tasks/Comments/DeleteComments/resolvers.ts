/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Resolvers } from '../../../../graphql-rest.page.generated';

export const DeleteCommentResolvers: Resolvers = {
  Mutation: {
    deleteComment: (
      _source,
      { input: { taskId, commentId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.deleteComment(taskId, commentId);
    },
  },
};
