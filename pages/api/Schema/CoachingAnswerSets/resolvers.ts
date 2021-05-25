import { Resolvers } from '../../graphql-rest.page.generated';

const CoachingAnswerSetsResolvers: Resolvers = {
  Query: {
    coachingAnswerSets: (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getCoachingAnswerSets(accountListId);
    },
  },
};

export { CoachingAnswerSetsResolvers };
