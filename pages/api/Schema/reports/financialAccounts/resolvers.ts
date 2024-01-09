import { Resolvers } from '../../../graphql-rest.page.generated';

export const FinancialAccountsResolvers: Resolvers = {
  Mutation: {
    setActiveFinancialAccount: (
      _source,
      { input: { accountListId, active, financialAccountId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.setActiveFinancialAccount(
        accountListId,
        active,
        financialAccountId,
      );
    },
  },
};
