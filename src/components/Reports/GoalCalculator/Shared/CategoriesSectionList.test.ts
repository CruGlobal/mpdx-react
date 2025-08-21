import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from './GoalCalculation.generated';
import { getFamilySections } from './familySections';

describe('getFamilySections', () => {
  it('should return empty array when budget family has no primary categories', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([]);
  });

  it('should return sections with complete=false when category has no direct input and no sub-categories with amounts', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Travel Expenses',
              directInput: null,
              subBudgetCategories: [
                {
                  id: 'sub-1',
                  amount: 0,
                },
                {
                  id: 'sub-2',
                  amount: 0,
                },
              ],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Travel Expenses',
        complete: false,
      },
    ]);
  });

  it('should return sections with complete=true when category has direct input', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Salary Expenses',
              directInput: 5000,
              subBudgetCategories: [],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Salary Expenses',
        complete: true,
      },
    ]);
  });

  it('should return sections with complete=true when category has sub-categories with amounts greater than 0', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Housing Expenses',
              directInput: null,
              subBudgetCategories: [
                {
                  id: 'sub-1',
                  amount: 0,
                },
                {
                  id: 'sub-2',
                  amount: 1200,
                },
              ],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Housing Expenses',
        complete: true,
      },
    ]);
  });

  it('should return sections with complete=true when category has both direct input and sub-categories with amounts', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Office Expenses',
              directInput: 500,
              subBudgetCategories: [
                {
                  id: 'sub-1',
                  amount: 300,
                },
              ],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Office Expenses',
        complete: true,
      },
    ]);
  });

  it('should handle multiple categories with mixed completion states', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Travel Expenses',
              directInput: null,
              subBudgetCategories: [
                {
                  id: 'sub-1',
                  amount: 0,
                },
              ],
            },
            {
              id: 'category-2',
              label: 'Salary Expenses',
              directInput: 5000,
              subBudgetCategories: [],
            },
            {
              id: 'category-3',
              label: 'Housing Expenses',
              directInput: null,
              subBudgetCategories: [
                {
                  id: 'sub-2',
                  amount: 1200,
                },
              ],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Travel Expenses',
        complete: false,
      },
      {
        title: 'Salary Expenses',
        complete: true,
      },
      {
        title: 'Housing Expenses',
        complete: true,
      },
    ]);
  });

  it('should return sections with complete=true when directInput is 0 (since 0 is not null)', () => {
    const budgetFamily = gqlMock<BudgetFamilyFragment>(
      BudgetFamilyFragmentDoc,
      {
        mocks: {
          primaryBudgetCategories: [
            {
              id: 'category-1',
              label: 'Equipment Expenses',
              directInput: 0,
              subBudgetCategories: [],
            },
          ],
        },
      },
    );

    const result = getFamilySections(budgetFamily);

    expect(result).toEqual([
      {
        title: 'Equipment Expenses',
        complete: true,
      },
    ]);
  });
});
