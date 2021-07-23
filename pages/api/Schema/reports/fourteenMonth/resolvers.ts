import { Resolvers } from '../../../graphql-rest.page.generated';

const FourteenMonthReportResolvers: Resolvers = {
  Query: {
    fourteenMonthReport: (
      _source,
      { accountListId, currencyType },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getFourteenMonthReport(
        accountListId,
        currencyType,
      );
    },
  },
};

export { FourteenMonthReportResolvers };
