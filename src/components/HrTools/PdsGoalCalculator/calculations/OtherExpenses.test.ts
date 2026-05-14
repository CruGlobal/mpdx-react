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
  adminRate: 0.12,
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
    it('grosses up (subtotal + attrition) so that fees are `creditCardFeeRate` of the post-fees total', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // (7400 + 444) / (1 - 0.06) - (7400 + 444) ≈ 500.68
      expect(result.creditCardFees).toBeCloseTo(500.68);
    });
  });

  describe('assessment', () => {
    it('grosses up (subtotal + creditCardFees + attrition) so that admin is `adminRate` of the post-admin total', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // adminBase=7400+500.68+444=8344.68; assessment = adminBase/0.88 - adminBase ≈ 1137.91
      expect(result.assessment).toBeCloseTo(1137.91, 1);
    });

    it('returns 0 when adminRate is 0', () => {
      const result = calculateOtherExpenses(fullTime(), {
        ...defaultConstants,
        adminRate: 0,
      });
      expect(result.assessment).toBe(0);
    });
  });

  describe('end-to-end totals', () => {
    it('produces correct totals for a full-time employee', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      expect(result.reimbursableExpenses).toBe(500);
      expect(result.fourOThreeBContributions).toBeCloseTo(400);
      expect(result.workComp).toBe(0);
      expect(result.benefits).toBe(1500);
      expect(result.subtotal).toBeCloseTo(7400);
      expect(result.attrition).toBeCloseTo(444);
      expect(result.creditCardFees).toBeCloseTo(500.68);
      expect(result.assessment).toBeCloseTo(1137.91, 1);
    });

    it('produces correct totals for a part-time employee', () => {
      const result = calculateOtherExpenses(partTime(), defaultConstants);
      // reimbursable=500, 403b=400, workComp=4000*0.17=680, benefits=0
      // subtotal=5000+500+400+680+0=6580
      // attrition=6580*0.06=394.80
      // creditCardFees=(6580+394.80)/(1-0.06)-(6580+394.80)≈445.20
      // adminBase=6580+445.20+394.80=7420
      // assessment = adminBase/0.88 - adminBase ≈ 1011.82
      expect(result.subtotal).toBeCloseTo(6580);
      expect(result.attrition).toBeCloseTo(394.8);
      expect(result.creditCardFees).toBeCloseTo(445.2, 1);
      expect(result.assessment).toBeCloseTo(1011.82, 1);
    });
  });
});
