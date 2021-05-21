import { gql } from 'graphql-tag';

const CoachingAnswerSetsTypeDefs = gql`
  extend type Query {
    coachingAnswerSets(accountListId: ID!): [CoachingAnswerSet!]!
  }

  type CoachingAnswerSet {
    id: ID!
    answers: [CoachingAnswer!]!
    completedAt: ISO8601DateTime!
    createdAt: ISO8601DateTime!
    questions: [CoachingQuestion!]!
    updatedAt: ISO8601DateTime!
  }

  type CoachingQuestion {
    id: ID!
    createdAt: ISO8601DateTime!
    position: Int!
    prompt: String!
    required: Boolean!
    responseOptions: [String!]
    updatedAt: ISO8601DateTime!
  }

  type CoachingAnswer {
    id: ID!
    createdAt: ISO8601DateTime!
    response: String
    question: CoachingQuestion!
    updatedAt: ISO8601DateTime!
  }

  scalar ISO8601DateTime
  scalar User
`;

export default CoachingAnswerSetsTypeDefs;
