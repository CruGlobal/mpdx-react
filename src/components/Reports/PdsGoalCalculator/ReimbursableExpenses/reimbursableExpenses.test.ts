import {
  REIMBURSABLE_FLOOR,
  ReimbursableCalculationFields,
  calculateReimbursableTotals,
} from './reimbursableExpenses';

const emptyCalculation: ReimbursableCalculationFields = {
  ministryCellPhone: null,
  ministryInternet: null,
  mpdNewsletter: null,
  mpdMiscellaneous: null,
  accountTransfers: null,
  otherMonthlyReimbursements: null,
  conferenceRetreatCosts: null,
  ministryTravelMeals: null,
  otherAnnualReimbursements: null,
};

describe('calculateReimbursableTotals', () => {
  it('returns the floor when all fields are null', () => {
    const result = calculateReimbursableTotals(emptyCalculation);
    expect(result.monthlySubtotal).toBe(0);
    expect(result.annualSubtotal).toBe(0);
    expect(result.raw).toBe(0);
    expect(result.total).toBe(REIMBURSABLE_FLOOR);
    expect(result.floorApplied).toBe(true);
  });

  it('applies the floor when monthly subtotal is below 300 with no annual', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      ministryCellPhone: 100,
      ministryInternet: 150,
    });
    expect(result.monthlySubtotal).toBe(250);
    expect(result.raw).toBe(250);
    expect(result.total).toBe(REIMBURSABLE_FLOOR);
    expect(result.floorApplied).toBe(true);
  });

  it('applies the floor at the exact boundary when raw equals the floor', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      ministryCellPhone: 150,
      ministryInternet: 150,
    });
    expect(result.raw).toBe(REIMBURSABLE_FLOOR);
    expect(result.total).toBe(REIMBURSABLE_FLOOR);
    expect(result.floorApplied).toBe(true);
  });

  it('returns the exact monthly subtotal when above the floor', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      ministryCellPhone: 200,
      ministryInternet: 200,
    });
    expect(result.monthlySubtotal).toBe(400);
    expect(result.total).toBe(400);
    expect(result.floorApplied).toBe(false);
  });

  it('divides annual subtotal by 12 and applies the floor when result is below', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      conferenceRetreatCosts: 1200,
    });
    expect(result.annualSubtotal).toBe(1200);
    expect(result.raw).toBe(100);
    expect(result.total).toBe(REIMBURSABLE_FLOOR);
    expect(result.floorApplied).toBe(true);
  });

  it('combines monthly and annual contributions above the floor', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      ministryCellPhone: 50,
      ministryInternet: 50,
      mpdNewsletter: 25,
      mpdMiscellaneous: 25,
      accountTransfers: 50,
      otherMonthlyReimbursements: 50,
      conferenceRetreatCosts: 600,
      ministryTravelMeals: 600,
      otherAnnualReimbursements: 0,
    });
    expect(result.monthlySubtotal).toBe(250);
    expect(result.annualSubtotal).toBe(1200);
    expect(result.raw).toBe(350);
    expect(result.total).toBe(350);
    expect(result.floorApplied).toBe(false);
  });

  it('treats null fields as zero alongside non-null values', () => {
    const result = calculateReimbursableTotals({
      ...emptyCalculation,
      ministryCellPhone: 500,
      ministryInternet: null,
    });
    expect(result.monthlySubtotal).toBe(500);
    expect(result.total).toBe(500);
  });
});
