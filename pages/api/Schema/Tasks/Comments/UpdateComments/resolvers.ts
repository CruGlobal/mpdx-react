/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Resolvers } from '../../../../graphql-rest.page.generated';

export const UpdateCommentResolvers: Resolvers = {
  Mutation: {
    updateComment: (
      _source,
      { input: { taskId, commentId, body } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.updateComment(taskId, commentId, body);
    },
  },
};
