import { Resolvers } from '../../../graphql-rest.page.generated';
/**
 * This will work with both accountList and CoachingAccountList Ids.
 */
const ReportsPledgeHistoriesResolvers: Resolvers = {
  Query: {
    reportPledgeHistories: async (
      _source,
      { accountListId, range, endDate },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getReportPledgeHistories(
        accountListId,
        range,
        endDate,
      );
    },
  },
};

export { ReportsPledgeHistoriesResolvers };
