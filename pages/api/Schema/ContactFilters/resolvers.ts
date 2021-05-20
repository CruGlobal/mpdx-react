import { Resolvers } from '../../graphql-rest.page.generated';

const ContactFiltersResolvers: Resolvers = {
  Query: {
    contactFilters: (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getContactFilters(accountListId);
    },
  },
};

export default ContactFiltersResolvers;
