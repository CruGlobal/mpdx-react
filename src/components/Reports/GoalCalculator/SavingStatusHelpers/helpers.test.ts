import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationDocument,
  GoalCalculationQuery,
  GoalCalculationQueryVariables,
} from '../Shared/GoalCalculation.generated';
import { getGoalLastUpdated } from './helpers';

describe('getGoalLastUpdated', () => {
  const makeTimestamp = (seconds: number) =>
    `2025-01-01T00:00:${seconds.toString().padStart(2, '0')}Z`;

  it('should return the goal calculation updatedAt when no families have later timestamps', () => {
    const { goalCalculation } = gqlMock<
      GoalCalculationQuery,
      GoalCalculationQueryVariables
    >(GoalCalculationDocument, {
      variables: {
        accountListId: 'account-list-1',
        id: 'goal-calculation-1',
      },
      mocks: {
        goalCalculation: {
          updatedAt: makeTimestamp(17),
          ministryFamily: {
            updatedAt: makeTimestamp(10),
            primaryBudgetCategories: [
              {
                updatedAt: makeTimestamp(15),
                subBudgetCategories: [
                  { updatedAt: makeTimestamp(20) },
                  { updatedAt: makeTimestamp(25) },
                ],
              },
              {
                updatedAt: makeTimestamp(12),
                subBudgetCategories: [],
              },
            ],
          },
          householdFamily: {
            updatedAt: makeTimestamp(5),
            primaryBudgetCategories: [
              {
                updatedAt: makeTimestamp(8),
                subBudgetCategories: [{ updatedAt: makeTimestamp(50) }], // Latest timestamp
              },
            ],
          },
          specialFamily: {
            updatedAt: makeTimestamp(2),
            primaryBudgetCategories: [
              {
                updatedAt: makeTimestamp(7),
                subBudgetCategories: [
                  { updatedAt: makeTimestamp(35) },
                  { updatedAt: makeTimestamp(40) },
                ],
              },
            ],
          },
        },
      },
    });

    expect(getGoalLastUpdated(goalCalculation)).toBe('2025-01-01T00:00:50Z');
  });
});
