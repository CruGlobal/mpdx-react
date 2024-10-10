import { Resolvers } from '../../../../graphql-rest.page.generated';

export const FinancialAccountSummaryResolvers: Resolvers = {
  Query: {
    financialAccountSummary: (
      _source,
      { input: { accountListId, financialAccountId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.financialAccountSummary(
        accountListId,
        financialAccountId,
      );
    },
  },
};
