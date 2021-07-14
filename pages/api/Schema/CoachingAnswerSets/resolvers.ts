import { Resolvers } from '../../graphql-rest.page.generated';

const CoachingAnswerSetsResolvers: Resolvers = {
  Query: {
    coachingAnswerSets: (
      _source,
      { accountListId, completed },
      { dataSources },
    ) => {
      debugger;
      return dataSources.mpdxRestApi.getCoachingAnswerSets(
        accountListId,
        completed,
      );
    },
  },
};

export { CoachingAnswerSetsResolvers };
