import { Resolvers } from '../../../graphql-rest.page.generated';

export const ExpectedMonthlyTotalReportResolvers: Resolvers = {
  Query: {
    expectedMonthlyTotalReport: (
      _source,
      { accountListId, designationAccountId },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getExpectedMonthlyTotalReport(
        accountListId,
        designationAccountId,
      );
    },
  },
};
