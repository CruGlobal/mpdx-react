import {
  BudgetFamilyCategoryEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { MinistryFamily, getPrimaryTotal, getSubTotal } from './helpers';
import type { SubBudgetCategory } from './helpers';

const mockFamily: MinistryFamily = {
  __typename: 'BudgetFamily',
  category: BudgetFamilyCategoryEnum.Ministry,
  id: '1',
  label: 'Ministry',
  primaryBudgetCategories: [
    {
      __typename: 'PrimaryBudgetCategory',
      category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
      id: 'p1',
      label: 'Medical & Mileage',
      subBudgetCategories: [
        {
          __typename: 'SubBudgetCategory',
          id: 's1',
          category: 'MINISTRY_MILEAGE' as SubBudgetCategory['category'],
          label: 'Ministry Mileage',
          amount: 100,
        },
        {
          __typename: 'SubBudgetCategory',
          id: 's2',
          category: 'MEDICAL_MILEAGE' as SubBudgetCategory['category'],
          label: 'Medical Mileage',
          amount: 200,
        },
      ],
    },
  ],
};

describe('getSubcategoryTotal', () => {
  it('returns total for matching subcategory in primary category', () => {
    expect(
      getSubTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        'MINISTRY_MILEAGE',
      ),
    ).toBe(100);
    expect(
      getSubTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        'MEDICAL_MILEAGE',
      ),
    ).toBe(200);
  });

  it('returns 0 if no matching subcategory', () => {
    expect(
      getSubTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        'DOES_NOT_EXIST',
      ),
    ).toBe(0);
  });
});

describe('getPrimaryCategoryTotal', () => {
  it('returns sum of all subcategory amounts for primary category', () => {
    expect(
      getPrimaryTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
      ),
    ).toBe(300);
    expect(
      getPrimaryTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
      ),
    ).toBe(300);
  });

  it('returns 0 if no matching primary category', () => {
    expect(getPrimaryTotal(mockFamily, 'CATEGORY_X')).toBe(0);
  });
});
