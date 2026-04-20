import { DesignationSupportStatus } from 'src/graphql/types.generated';
import {
  OtherExpensesConstants,
  OtherExpensesFields,
  calculateOtherExpenses,
} from './OtherExpenses';

const defaultConstants: OtherExpensesConstants = {
  reimbursableTotal: 500,
  salarySubtotal: 5000,
  fourOThreeBPercentage: 0.1,
  grossMonthlyPay: 4000,
  workCompPercentage: 0.17,
  attritionRate: 0.06,
  creditCardFeeRate: 0.06,
};

const fullTime = (
  overrides: Partial<OtherExpensesFields> = {},
): OtherExpensesFields => ({
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
  ...overrides,
});

const partTime = (
  overrides: Partial<OtherExpensesFields> = {},
): OtherExpensesFields => ({
  status: DesignationSupportStatus.PartTime,
  benefits: null,
  ...overrides,
});

const noStatus = (
  overrides: Partial<OtherExpensesFields> = {},
): OtherExpensesFields => ({
  status: null,
  benefits: null,
  ...overrides,
});

describe('calculateOtherExpenses', () => {
  describe('reimbursable expenses', () => {
    it('passes through the reimbursable total from constants', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      expect(result.reimbursableExpenses).toBe(500);
    });
  });

  describe('403b contributions', () => {
    it('calculates as grossMonthlyPay × fourOThreeBPercentage', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // 4000 * 0.1
      expect(result.fourOThreeBContributions).toBeCloseTo(400);
    });
  });

  describe('work comp', () => {
    it('calculates as grossMonthlyPay × workCompPercentage for part-time', () => {
      const result = calculateOtherExpenses(partTime(), defaultConstants);
      // 4000 * 0.17
      expect(result.workComp).toBeCloseTo(680);
    });

    it('is 0 for full-time', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      expect(result.workComp).toBe(0);
    });
  });

  describe('benefits', () => {
    it('uses calculation.benefits for full-time', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      expect(result.benefits).toBe(1500);
    });

    it('is 0 for part-time', () => {
      const result = calculateOtherExpenses(partTime(), defaultConstants);
      expect(result.benefits).toBe(0);
    });

    it('treats null benefits as 0 for full-time', () => {
      const result = calculateOtherExpenses(
        fullTime({ benefits: null }),
        defaultConstants,
      );
      expect(result.benefits).toBe(0);
    });
  });

  // When status is null or undefined, both isFullTime and isPartTime are false.
  // This means no work comp (part-time only) AND no benefits (full-time only).
  describe('null/undefined status', () => {
    it('excludes both workComp and benefits when status is null', () => {
      const result = calculateOtherExpenses(noStatus(), defaultConstants);
      expect(result.workComp).toBe(0);
      expect(result.benefits).toBe(0);
    });

    it('excludes both workComp and benefits when status is undefined', () => {
      const result = calculateOtherExpenses(
        noStatus({ status: undefined }),
        defaultConstants,
      );
      expect(result.workComp).toBe(0);
      expect(result.benefits).toBe(0);
    });

    it('calculates subtotal without workComp or benefits when status is null', () => {
      const result = calculateOtherExpenses(noStatus(), defaultConstants);
      // 5000 + 500 + 400 + 0 + 0
      expect(result.subtotal).toBeCloseTo(5900);
    });
  });

  describe('subtotal', () => {
    it('sums salarySubtotal + reimbursable + 403b + benefits for full-time', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // 5000 + 500 + 400 + 0 + 1500
      expect(result.subtotal).toBeCloseTo(7400);
    });

    it('sums salarySubtotal + reimbursable + 403b + workComp for part-time', () => {
      const result = calculateOtherExpenses(partTime(), defaultConstants);
      // 5000 + 500 + 400 + 680 + 0
      expect(result.subtotal).toBeCloseTo(6580);
    });
  });

  describe('attrition', () => {
    it('is 6% of subtotal', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // 7400 * 0.06
      expect(result.attrition).toBeCloseTo(444);
    });
  });

  describe('credit card fees', () => {
    it('is 6% of (subtotal + attrition)', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // (7400 + 444) * 0.06
      expect(result.creditCardFees).toBeCloseTo(470.64);
    });
  });

  describe('assessment', () => {
    it('is (subtotal + attrition + creditCardFees) / 0.88 minus itself', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      const preAssessment =
        result.subtotal + result.attrition + result.creditCardFees;
      const expected = preAssessment / 0.88 - preAssessment;
      expect(result.assessment).toBeCloseTo(expected);
    });
  });
});
