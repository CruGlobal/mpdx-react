import { Resolvers } from '../../../../../graphql-rest.page.generated';

const DeleteOrganizationContactResolvers: Resolvers = {
  Mutation: {
    deleteOrganizationContact: async (
      _source,
      { input: { contactId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.deleteOrganizationContact(contactId);
    },
  },
};

export { DeleteOrganizationContactResolvers };
