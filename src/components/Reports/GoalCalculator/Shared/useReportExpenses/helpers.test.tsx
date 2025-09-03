import { gqlMock } from '__tests__/util/graphqlMocking';
import {} from 'src/graphql/types.generated';
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
  it('returns correct sum of all primary category amounts for ministry family with a directInput value set', () => {
    expect(getFamilyTotal(mockFamily)).toBe(720);
  });

  it('returns sum of all primary category amounts for ministry family without any directInput set', () => {
    const noDirectInputMockFamily = {
      ...mockFamily,
      primaryBudgetCategories: [
        { ...mockFamily.primaryBudgetCategories[0], directInput: null },
        mockFamily.primaryBudgetCategories[1],
      ],
    };
    expect(getFamilyTotal(noDirectInputMockFamily)).toBe(1000);
  });
});
