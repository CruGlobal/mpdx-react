import { Resolvers } from '../../graphql-rest.page.generated';

const AccountListDonorAccountsResolvers: Resolvers = {
  Query: {
    accountListDonorAccounts: async (
      _source,
      { accountListId, searchTerm },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getAccountListDonorAccounts(
        accountListId,
        searchTerm,
      );
    },
  },
};

export { AccountListDonorAccountsResolvers };
