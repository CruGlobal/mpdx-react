import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from '../GoalCalculation.generated';
import { getFamilyTotal, getPrimaryTotal } from './helpers';

const mockFamily = gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
  mocks: {
    primaryBudgetCategories: [
      {
        directInput: 20,
        subBudgetCategories: [{ amount: 100 }, { amount: 200 }],
      },
      {
        directInput: null,
        subBudgetCategories: [{ amount: 300 }, { amount: 400 }],
      },
    ],
  },
});

describe('getPrimaryCategoryTotal', () => {
  it('returns sum of all subcategory amounts for primary category with directInput set', () => {
    expect(getPrimaryTotal(mockFamily.primaryBudgetCategories[0])).toBe(20);
  });

  it('returns sum of all subcategory amounts for primary category without directInput set', () => {
    expect(getPrimaryTotal(mockFamily.primaryBudgetCategories[1])).toBe(700);
  });
});

describe('getMinistryExpensesTotal', () => {
  it('returns correct sum of all primary category amounts for ministry family with a primaryBudgetCategory directInput value set', () => {
    expect(getFamilyTotal({ ...mockFamily, directInput: null })).toBe(720);
  });
  it('returns sum of family directInput for ministry family with directInput set', () => {
    expect(getFamilyTotal({ ...mockFamily, directInput: 1200 })).toBe(1200);
  });
});
