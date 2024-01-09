import { Resolvers } from '../../graphql-rest.page.generated';

const ExportContactsResolvers: Resolvers = {
  Mutation: {
    exportContacts: (
      _source,
      { input: { mailing, format, labelType, sort, accountListId } },
      { dataSources },
    ) => {
      const filter = {
        account_list_id: accountListId,
        newsletter: 'address',
        status: 'active',
      };

      return dataSources.mpdxRestApi.createExportedContacts(
        mailing,
        format,
        filter,
        labelType,
        sort,
      );
    },
  },
};

export { ExportContactsResolvers };
