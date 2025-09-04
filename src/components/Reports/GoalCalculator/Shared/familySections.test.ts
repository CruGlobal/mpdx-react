import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from './GoalCalculation.generated';
import { getFamilySections } from './familySections';

describe('getFamilySections', () => {
  it('should calculate completion status', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              label: 'Incomplete',
              directInput: null,
              subBudgetCategories: [{ amount: 0 }, { amount: 0 }],
            },
            {
              label: 'Direct input',
              directInput: 1000,
              subBudgetCategories: [{ amount: 0 }, { amount: 0 }],
            },
            {
              label: 'Complete',
              directInput: null,
              subBudgetCategories: [{ amount: 100 }, { amount: 0 }],
            },
          ],
        },
      },
    );

    expect(getFamilySections(budgetFamily)).toEqual([
      { title: 'Incomplete', complete: false },
      { title: 'Direct input', complete: true },
      { title: 'Complete', complete: true },
    ]);
  });
});
