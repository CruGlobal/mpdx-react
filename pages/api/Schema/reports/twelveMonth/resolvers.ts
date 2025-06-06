import { Resolvers } from '../../../graphql-rest.page.generated';

const TwelveMonthReportResolvers: Resolvers = {
  Query: {
    twelveMonthReport: (
      _source,
      { accountListId, designationAccountId, currencyType },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getTwelveMonthReport(
        accountListId,
        designationAccountId,
        currencyType,
      );
    },
  },
};

export { TwelveMonthReportResolvers };
