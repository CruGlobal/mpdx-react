import { calculatePercentage } from './calculatePercentage';

describe('calculatePercentage', () => {
  it('should return 0 when no data', () => {
    expect(calculatePercentage({ data: undefined })).toEqual(0);
  });

  it('should return 0 when no goalCalculation', () => {
    expect(calculatePercentage({ data: {} as any })).toEqual(0);
  });

  it('should calculate 100% for all complete categories', () => {
    const mockData = {
      goalCalculation: {
        ministryFamily: {
          primaryBudgetCategories: [
            { directInput: 0, subBudgetCategories: [] },
            { directInput: 100, subBudgetCategories: [] },
            {
              directInput: null,
              subBudgetCategories: [{ amount: 50 }],
            },
          ],
        },
        householdFamily: {
          primaryBudgetCategories: [],
        },
      },
    };

    expect(calculatePercentage({ data: mockData as any })).toEqual(100);
  });

  it('should calculate 67% for mixed completion', () => {
    const mockData = {
      goalCalculation: {
        ministryFamily: {
          primaryBudgetCategories: [
            { directInput: 0, subBudgetCategories: [] }, // complete
            { directInput: null, subBudgetCategories: [{ amount: 0 }] }, // incomplete
          ],
        },
        householdFamily: {
          primaryBudgetCategories: [
            { directInput: 100, subBudgetCategories: [] }, // complete
          ],
        },
      },
    };
    expect(calculatePercentage({ data: mockData as any })).toEqual(67);
  });
});
