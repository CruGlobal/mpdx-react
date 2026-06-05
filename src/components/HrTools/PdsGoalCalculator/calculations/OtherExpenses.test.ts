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
  workCompAmount: 555,
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
    it('uses the fixed workCompAmount for part-time', () => {
      const result = calculateOtherExpenses(partTime(), defaultConstants);
      // fixed amount — chosen to not equal any product of other constants
      expect(result.workComp).toBeCloseTo(555);
    });

    it('does not vary with grossMonthlyPay (regression guard against the old percent-of-pay formula)', () => {
      const base = calculateOtherExpenses(partTime(), defaultConstants);
      const tripled = calculateOtherExpenses(partTime(), {
        ...defaultConstants,
        grossMonthlyPay: defaultConstants.grossMonthlyPay * 3,
      });
      expect(tripled.workComp).toBe(base.workComp);
    });

    it('returns 0 workComp when workCompAmount is 0 (regression guard against falsy-check replacement)', () => {
      const result = calculateOtherExpenses(partTime(), {
        ...defaultConstants,
        workCompAmount: 0,
      });
      expect(result.workComp).toBe(0);
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
      // 5000 + 500 + 400 + 555 + 0
      expect(result.subtotal).toBeCloseTo(6455);
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

    it('returns 0 when creditCardFeeRate is 0', () => {
      const result = calculateOtherExpenses(fullTime(), {
        ...defaultConstants,
        creditCardFeeRate: 0,
      });
      expect(result.creditCardFees).toBe(0);
    });
  });

  describe('assessment', () => {
    it('grosses up (subtotal + attrition + creditCardFees) so that admin is `adminRate` of the post-admin total', () => {
      const result = calculateOtherExpenses(fullTime(), defaultConstants);
      // adminBase=7400+444+500.68=8344.68; assessment = adminBase/0.88 - adminBase ≈ 1137.91
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
      // reimbursable=500, 403b=400, workComp=555 (fixed), benefits=0
      // subtotal=5000+500+400+555+0=6455
      // attrition=6455*0.06=387.30
      // creditCardFees=(6455+387.30)/(1-0.06)-(6455+387.30)≈436.74
      // adminBase=6455+387.30+436.74≈7279.04
      // assessment = adminBase/0.88 - adminBase ≈ 992.60
      expect(result.subtotal).toBeCloseTo(6455);
      expect(result.attrition).toBeCloseTo(387.3);
      expect(result.creditCardFees).toBeCloseTo(436.74, 1);
      expect(result.assessment).toBeCloseTo(992.6, 1);
    });
  });
});
