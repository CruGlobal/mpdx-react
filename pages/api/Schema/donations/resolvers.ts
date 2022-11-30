import { Resolvers } from '../../graphql-rest.page.generated';

export const DesginationDisplayNamesResolvers: Resolvers = {
  Query: {
    desginationDisplayNames: (
      _source,
      { accountListId, startDate, endDate },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getDesginationDisplayNames(
        accountListId,
        startDate,
        endDate,
      );
    },
  },
};
