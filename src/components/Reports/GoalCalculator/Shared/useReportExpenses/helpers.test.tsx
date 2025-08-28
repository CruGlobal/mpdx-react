import {
  BudgetFamilyCategoryEnum,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import {
  MinistryFamily,
  getMinistryExpensesTotal,
  getPrimaryTotal,
} from './helpers';

const mockFamily: MinistryFamily = {
  __typename: 'BudgetFamily',
  category: BudgetFamilyCategoryEnum.Ministry,
  id: '1',
  label: 'Ministry',
  primaryBudgetCategories: [
    {
      __typename: 'PrimaryBudgetCategory',
      category: PrimaryBudgetCategoryEnum.Utilities,
      id: 'p1',
      label: 'Utilities',
      subBudgetCategories: [
        {
          __typename: 'SubBudgetCategory',
          id: 's1',
          category: SubBudgetCategoryEnum.UtilitiesInternet,
          label: 'Internet',
          amount: 100,
        },
        {
          __typename: 'SubBudgetCategory',
          id: 's2',
          category: SubBudgetCategoryEnum.UtilitiesGas,
          label: 'Gas',
          amount: 200,
        },
      ],
    },
    {
      __typename: 'PrimaryBudgetCategory',
      category: PrimaryBudgetCategoryEnum.Recreation,
      id: 'p2',
      label: 'Recreation',
      subBudgetCategories: [
        {
          __typename: 'SubBudgetCategory',
          id: 's3',
          category: SubBudgetCategoryEnum.RecreationEntertainment,
          label: 'Entertainment',
          amount: 300,
        },
        {
          __typename: 'SubBudgetCategory',
          id: 's4',
          category: SubBudgetCategoryEnum.RecreationVacation,
          label: 'Travel',
          amount: 400,
        },
      ],
    },
  ],
};

describe('getPrimaryCategoryTotal', () => {
  it('returns sum of all subcategory amounts for primary category', () => {
    expect(getPrimaryTotal(mockFamily.primaryBudgetCategories[0])).toBe(300);
  });

  describe('getMinistryExpensesTotal', () => {
    it('returns sum of all primary category amounts for ministry family', () => {
      expect(getMinistryExpensesTotal(mockFamily)).toBe(1000);
    });
  });
});
