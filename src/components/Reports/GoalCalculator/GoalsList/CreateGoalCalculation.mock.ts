import { BudgetFamilyCategoryEnum } from 'src/graphql/types.generated';
import { CreateGoalCalculationMutation } from './CreateGoalCalculation.generated';

export const createGoalCalculationMock = (): CreateGoalCalculationMutation => ({
  createGoalCalculation: {
    goalCalculation: {
      id: '1234',
      primary: true,
      isCurrent: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      ministryFamily: {
        id: 'ministry-1',
        label: 'Ministry',
        category: BudgetFamilyCategoryEnum.Ministry,
        directInput: 1,
        primaryBudgetCategories: [],
      },
      householdFamily: {
        id: 'household-1',
        label: 'Household',
        category: BudgetFamilyCategoryEnum.Household,
        directInput: 1,
        primaryBudgetCategories: [],
      },
      specialFamily: {
        id: 'special-1',
        label: 'Special',
        category: BudgetFamilyCategoryEnum.Special,
        directInput: 1,
        primaryBudgetCategories: [],
      },
    },
  },
});
