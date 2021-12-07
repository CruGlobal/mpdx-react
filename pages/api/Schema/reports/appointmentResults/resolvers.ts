import { Resolvers } from 'pages/api/graphql-rest.page.generated';

/**
 * This will work with both accountList and CoachingAccountList Ids.
 */
const AppointmentResultsResolvers: Resolvers = {
  Query: {
    appointmentResults: async (
      _source,
      { accountListId, endDate, range },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getAppointmentResults(
        accountListId,
        endDate,
        range,
      );
    },
  },
};

export { AppointmentResultsResolvers };
