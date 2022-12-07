import { Resolvers } from '../../../../graphql-rest.page.generated';

export const DestroyDonorAccountResolvers: Resolvers = {
  Mutation: {
    destroyDonorAccount: (
      _source,
      { input: { contactId, donorAccountId, donorAccounts } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.destroyDonorAccount(
        contactId,
        donorAccountId,
        donorAccounts,
      );
    },
  },
};
