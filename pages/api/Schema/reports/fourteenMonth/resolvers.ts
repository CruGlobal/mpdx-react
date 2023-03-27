import { Resolvers } from '../../../graphql-rest.page.generated';

const FourteenMonthReportResolvers: Resolvers = {
  Query: {
    fourteenMonthReport: (
      _source,
      { accountListId, designationAccountId, currencyType },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getFourteenMonthReport(
        accountListId,
        designationAccountId,
        currencyType,
      );
    },
  },
};

export { FourteenMonthReportResolvers };
