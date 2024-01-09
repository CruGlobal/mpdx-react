import { Resolvers } from '../../../graphql-rest.page.generated';

export const PartnerGivingAnalysisReportResolvers: Resolvers = {
  Query: {
    partnerGivingAnalysisReport: (
      _source,
      {
        input: {
          accountListId,
          page,
          pageSize,
          sortDirection,
          sortField,
          contactFilters,
        },
      },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getPartnerGivingAnalysis(
        accountListId,
        page,
        pageSize,
        sortField,
        sortDirection === 'ASCENDING',
        contactFilters,
      );
    },
  },
};
