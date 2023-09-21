import { Resolvers } from '../../../../../graphql-rest.page.generated';

const AdminDeleteOrganizationCoachResolvers: Resolvers = {
  Mutation: {
    adminDeleteOrganizationCoach: async (
      _source,
      { input: { accountListId, coachId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.adminDeleteOrganizationCoach(
        accountListId,
        coachId,
      );
    },
  },
};

export { AdminDeleteOrganizationCoachResolvers };
