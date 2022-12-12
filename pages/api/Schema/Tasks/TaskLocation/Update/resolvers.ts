/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Resolvers } from '../../../../graphql-rest.page.generated';

export const UpdateTaskLocationResolvers: Resolvers = {
  Mutation: {
    updateTaskLocation: (
      _source,
      { input: { taskId, location } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.updateTaskLocation(taskId, location);
    },
  },
};
