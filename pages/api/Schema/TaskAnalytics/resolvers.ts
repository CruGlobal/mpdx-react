import { Resolvers } from '../../graphql-rest.page.generated';

const TaskAnalyticsResolvers: Resolvers = {
  Query: {
    taskAnalytics: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getTaskAnalytics(accountListId);
    },
  },
};

export default TaskAnalyticsResolvers;
