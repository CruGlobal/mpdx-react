import { hasPopulatedValues } from './hasPopulatedValues';

describe('hasPopulatedValues', () => {
  it('returns false when requestAttributes is null', () => {
    expect(hasPopulatedValues(null)).toBe(false);
  });

  it('returns true when at least one calculation field is populated', () => {
    const incompleteAttributes = {
      rentalValue: null,
      furnitureCostsOne: null,
      avgUtilityOne: 150,
      mortgageOrRentPayment: null,
      furnitureCostsTwo: null,
      repairCosts: 50,
      avgUtilityTwo: null,
      unexpectedExpenses: 75,
      iUnderstandMhaPolicy: null,
    };

    expect(hasPopulatedValues(incompleteAttributes)).toBe(true);
  });

  it('returns false when no calculation fields are populated', () => {
    const completeAttributes = {
      rentalValue: null,
      furnitureCostsOne: null,
      avgUtilityOne: null,
      mortgageOrRentPayment: null,
      furnitureCostsTwo: null,
      repairCosts: null,
      avgUtilityTwo: null,
      unexpectedExpenses: null,
      iUnderstandMhaPolicy: null,
    };

    expect(hasPopulatedValues(completeAttributes)).toBe(false);
  });
});
