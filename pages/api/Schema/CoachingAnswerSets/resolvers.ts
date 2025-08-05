import { Resolvers } from '../../graphql-rest.page.generated';

const CoachingAnswerSetsResolvers: Resolvers = {
  Query: {
    coachingAnswerSets: (
      _source,
      { accountListId, organizationId, completed },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getCoachingAnswerSets(
        accountListId,
        organizationId,
        completed,
        true,
      );
    },

    currentCoachingAnswerSet: (
      _source,
      { accountListId, organizationId },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.getCurrentCoachingAnswerSet(
        accountListId,
        organizationId,
      );
    },
  },

  Mutation: {
    saveCoachingAnswer: (
      _source,
      { input: { answerSetId, answerId, response, questionId } },
      { dataSources },
    ) => {
      return dataSources.mpdxRestApi.saveCoachingAnswer(
        answerSetId,
        questionId,
        answerId ?? null,
        response,
      );
    },
  },
};

export { CoachingAnswerSetsResolvers };
