import { Resolvers } from 'pages/api/graphql-rest.page.generated';

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
