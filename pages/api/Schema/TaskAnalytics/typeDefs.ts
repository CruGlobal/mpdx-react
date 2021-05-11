import { gql } from 'graphql-tag';

const TaskAnalyticsTypeDefs = gql`
  extend type Query {
    taskAnalytics(accountListId: ID!): TaskAnalytics!
  }
  type TaskAnalytics {
    id: ID!
    type: String!
    createdAt: ISO8601DateTime!
    lastElectronicNewsletterCompletedAt: ISO8601DateTime
    lastPhysicalNewsletterCompletedAt: ISO8601DateTime
    tasksOverdueOrDueTodayCounts: [OverdueOrDueTodayTaskAnalytic!]!
    totalTasksDueCount: Int!
    updatedAt: ISO8601DateTime!
    updatedInDbAt: ISO8601DateTime!
  }

  scalar ISO8601DateTime

  type OverdueOrDueTodayTaskAnalytic {
    label: String!
    count: Int!
  }
`;

export default TaskAnalyticsTypeDefs;
