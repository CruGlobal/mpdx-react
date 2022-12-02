import { Resolvers } from '../../../graphql-rest.page.generated';

export const TaskLocationResolvers: Resolvers = {
  Query: {
    taskLocation: (_source, { accountListId, taskId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getTaskLocation(accountListId, taskId);
    },
  },
};
