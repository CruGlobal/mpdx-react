import { Resolvers } from '../../../graphql-rest.page.generated';

export const DesignationAccountsResolvers: Resolvers = {
  Query: {
    designationAccounts: (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getDesignationAccounts(accountListId);
    },
    activeDesignationAccount: (
      _source,
      { accountListId, designationAccountId },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.setDesignationAccountActive(
        accountListId,
        designationAccountId,
      );
    },
  },
};
