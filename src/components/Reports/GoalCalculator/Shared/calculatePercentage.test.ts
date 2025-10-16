import { GoalCalculationQuery } from './GoalCalculation.generated';
import { calculatePercentage } from './calculatePercentage';

const createMockGoalCalculation = (
  ministryCategories: Array<{
    directInput?: number | null;
    subCategories?: Array<{ amount: number }>;
  }> = [],
  householdCategories: Array<{
    directInput?: number | null;
    subCategories?: Array<{ amount: number }>;
  }> = [],
): GoalCalculationQuery['goalCalculation'] =>
  ({
    ministryFamily: {
      primaryBudgetCategories: ministryCategories.map(
        (category, categoryIndex) => ({
          id: `${categoryIndex}`,
          directInput: category.directInput ?? null,
          subBudgetCategories: (category.subCategories || []).map(
            (subCategory, subIndex) => ({
              id: `${categoryIndex}-${subIndex}`,
              amount: subCategory.amount,
            }),
          ),
        }),
      ),
    },
    householdFamily: {
      primaryBudgetCategories: householdCategories.map(
        (category, categoryIndex) => ({
          id: `h-${categoryIndex}`,
          directInput: category.directInput ?? null,
          subBudgetCategories: (category.subCategories || []).map(
            (subCategory, subIndex) => ({
              id: `h-${categoryIndex}-${subIndex}`,
              amount: subCategory.amount,
            }),
          ),
        }),
      ),
    },
  }) as GoalCalculationQuery['goalCalculation'];

describe('calculatePercentage', () => {
  it('should return 0 when no data', () => {
    expect(calculatePercentage(undefined)).toEqual(0);
  });

  it('should calculate 100% for all complete categories', () => {
    const goalCalculation = createMockGoalCalculation([
      { directInput: 0 },
      { directInput: 100 },
      { subCategories: [{ amount: 50 }] },
    ]);

    expect(calculatePercentage(goalCalculation)).toEqual(100);
  });

  it('should calculate 67% for mixed completion', () => {
    const goalCalculation = createMockGoalCalculation(
      [{ directInput: 0 }, { subCategories: [{ amount: 0 }] }],
      [{ directInput: 100 }],
    );
    expect(calculatePercentage(goalCalculation)).toEqual(67);
  });
});
