import { Resolvers } from '../../graphql-rest.page.generated';

const AppealsResolvers: Resolvers = {
  Query: {
    appeals: (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getAppeals(accountListId);
    },
  },
};

export { AppealsResolvers };
