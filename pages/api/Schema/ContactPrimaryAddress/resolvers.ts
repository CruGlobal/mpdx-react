import { Resolvers } from '../../graphql-rest.page.generated';

export const ContactPrimaryAddressResolvers: Resolvers = {
  Mutation: {
    setContactPrimaryAddress: (
      _source,
      { input: { contactId, primaryAddressId } },
      { dataSources },
    ) =>
      dataSources.mpdxRestApi.setContactPrimaryAddress(
        contactId,
        primaryAddressId,
      ),
  },
};
