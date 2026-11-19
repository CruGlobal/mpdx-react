import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { goalCalculationMock } from '../GoalCalculatorTestWrapper';
import { calculateNewStaffReferenceTotals } from './calculateNewStaffReference';

describe('calculateNewStaffReferenceTotals', () => {
  it('returns zero totals without a goal calculation', () => {
    expect(calculateNewStaffReferenceTotals(undefined).overallTotal).toBe(0);
  });

  it('grosses up the reference salary, benefits and ministry expenses with the server rates', () => {
    const totals = calculateNewStaffReferenceTotals(goalCalculationMock);

    // Ministry: 98 + 60 + 100 + 60 + 124.5 + 50 + 330 = 822.5
    expect(totals.ministryExpensesTotal).toBeCloseTo(822.5, 2);
    // (6836 + 1910.54 + 822.5) / (1 - 0.12) * 1.06
    expect(totals.overallTotal).toBeCloseTo(11526.34, 2);
  });

  it("counts the person's own entries for the mirrored ministry categories", () => {
    const totals = calculateNewStaffReferenceTotals({
      ...goalCalculationMock,
      ministryFamily: {
        ...goalCalculationMock.ministryFamily,
        primaryBudgetCategories:
          goalCalculationMock.ministryFamily.primaryBudgetCategories.map(
            (category) =>
              category.category === PrimaryBudgetCategoryEnum.AccountTransfers
                ? { ...category, directInput: 250 }
                : category,
          ),
      },
    });

    expect(totals.ministryExpensesTotal).toBeCloseTo(1072.5, 2);
  });
});
