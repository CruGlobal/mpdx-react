import {
  BudgetFamilyCategoryEnum,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from '../../../../../pages/api/graphql-rest.page.generated';
import { GoalCalculationQuery } from './GoalCalculation.generated';
import { calculatePercentage } from './calculatePercentage';

describe('calculatePercentage', () => {
  it('should return 0 when no data', () => {
    expect(calculatePercentage({ data: undefined })).toEqual(0);
  });

  it('should return 0 when no goalCalculation', () => {
    const emptyData: GoalCalculationQuery = {
      __typename: 'Query',
    } as GoalCalculationQuery;
    expect(calculatePercentage({ data: emptyData })).toEqual(0);
  });

  it('should calculate 100% for all complete categories', () => {
    const mockData: GoalCalculationQuery = {
      __typename: 'Query',
      goalCalculation: {
        __typename: 'GoalCalculation',
        id: 'test-id',
        primary: true,
        ministryFamily: {
          __typename: 'BudgetFamily',
          id: 'ministry-family-id',
          label: 'Ministry Family',
          category: BudgetFamilyCategoryEnum.Ministry,
          directInput: null,
          primaryBudgetCategories: [
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-1',
              label: 'Category 1',
              category: PrimaryBudgetCategoryEnum.Food,
              directInput: 0,
              subBudgetCategories: [],
            },
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-2',
              label: 'Category 2',
              category: PrimaryBudgetCategoryEnum.Housing,
              directInput: 100,
              subBudgetCategories: [],
            },
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-3',
              label: 'Category 3',
              category: PrimaryBudgetCategoryEnum.Transportation,
              directInput: null,
              subBudgetCategories: [
                {
                  __typename: 'SubBudgetCategory',
                  id: 'sub-category-1',
                  label: 'Sub Category 1',
                  category: SubBudgetCategoryEnum.TransportationAutoGas,
                  amount: 50,
                },
              ],
            },
          ],
        },
        householdFamily: {
          __typename: 'BudgetFamily',
          id: 'household-family-id',
          label: 'Household Family',
          category: BudgetFamilyCategoryEnum.Household,
          directInput: null,
          primaryBudgetCategories: [],
        },
        specialFamily: {
          __typename: 'BudgetFamily',
          id: 'special-family-id',
          label: 'Special Family',
          category: BudgetFamilyCategoryEnum.Special,
          directInput: null,
          primaryBudgetCategories: [],
        },
      },
    };

    expect(calculatePercentage({ data: mockData })).toEqual(100);
  });

  it('should calculate 67% for mixed completion', () => {
    const mockData: GoalCalculationQuery = {
      __typename: 'Query',
      goalCalculation: {
        __typename: 'GoalCalculation',
        id: 'test-id-2',
        primary: true,
        ministryFamily: {
          __typename: 'BudgetFamily',
          id: 'ministry-family-id-2',
          label: 'Ministry Family',
          category: BudgetFamilyCategoryEnum.Ministry,
          directInput: null,
          primaryBudgetCategories: [
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-4',
              label: 'Category 4',
              category: PrimaryBudgetCategoryEnum.Food,
              directInput: 0,
              subBudgetCategories: [],
            },
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-5',
              label: 'Category 5',
              category: PrimaryBudgetCategoryEnum.Housing,
              directInput: null,
              subBudgetCategories: [
                {
                  __typename: 'SubBudgetCategory',
                  id: 'sub-category-2',
                  label: 'Sub Category 2',
                  category: SubBudgetCategoryEnum.HousingMortgageRent,
                  amount: 0,
                },
              ],
            },
          ],
        },
        householdFamily: {
          __typename: 'BudgetFamily',
          id: 'household-family-id-2',
          label: 'Household Family',
          category: BudgetFamilyCategoryEnum.Household,
          directInput: null,
          primaryBudgetCategories: [
            {
              __typename: 'PrimaryBudgetCategory',
              id: 'category-6',
              label: 'Category 6',
              category: PrimaryBudgetCategoryEnum.Transportation,
              directInput: 100,
              subBudgetCategories: [],
            },
          ],
        },
        specialFamily: {
          __typename: 'BudgetFamily',
          id: 'special-family-id-2',
          label: 'Special Family',
          category: BudgetFamilyCategoryEnum.Special,
          directInput: null,
          primaryBudgetCategories: [],
        },
      },
    };
    expect(calculatePercentage({ data: mockData })).toEqual(67);
  });
});
