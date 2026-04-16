import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
import {
  SalaryCalculationFields,
  calculateSalaryTotals,
} from './salaryCalculation';

const FICA_RATE = 0.08;

const salaried = (
  overrides: Partial<SalaryCalculationFields> = {},
): SalaryCalculationFields => ({
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 5000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  ...overrides,
});

const hourly = (
  overrides: Partial<SalaryCalculationFields> = {},
): SalaryCalculationFields => ({
  salaryOrHourly: DesignationSupportSalaryType.Hourly,
  payRate: 25,
  hoursWorkedPerWeek: 40,
  geographicLocation: null,
  ...overrides,
});

describe('calculateSalaryTotals', () => {
  describe('salaried', () => {
    it('uses payRate directly when there is no geographic multiplier', () => {
      const result = calculateSalaryTotals(salaried(), 0, FICA_RATE);
      expect(result.grossMonthlyPay).toBe(5000);
    });

    it('applies geographic multiplier additively', () => {
      const result = calculateSalaryTotals(salaried(), 0.06, FICA_RATE);
      expect(result.grossMonthlyPay).toBeCloseTo(5300);
    });

    it('ignores hoursWorkedPerWeek', () => {
      const result = calculateSalaryTotals(
        salaried({ hoursWorkedPerWeek: 40 }),
        0,
        FICA_RATE,
      );
      expect(result.grossMonthlyPay).toBe(5000);
    });
  });

  describe('hourly', () => {
    it('converts hourly rate to monthly when there is no geographic multiplier', () => {
      const result = calculateSalaryTotals(hourly(), 0, FICA_RATE);
      // 25 * 40 * 52 / 12
      expect(result.grossMonthlyPay).toBeCloseTo(4333.333, 2);
    });

    it('applies geographic multiplier to the hourly-derived monthly base', () => {
      const result = calculateSalaryTotals(hourly(), 0.06, FICA_RATE);
      // (25 * 40 * 52 / 12) * 1.06
      expect(result.grossMonthlyPay).toBeCloseTo(4593.333, 2);
    });
  });

  describe('null amounts', () => {
    it('treats null payRate as 0 when salaried', () => {
      const result = calculateSalaryTotals(
        salaried({ payRate: null }),
        0.06,
        FICA_RATE,
      );
      expect(result.grossMonthlyPay).toBe(0);
      expect(result.employerFica).toBe(0);
      expect(result.subtotal).toBe(0);
    });

    it('treats null hoursWorkedPerWeek as 0 when hourly', () => {
      const result = calculateSalaryTotals(
        hourly({ hoursWorkedPerWeek: null }),
        0,
        FICA_RATE,
      );
      expect(result.grossMonthlyPay).toBe(0);
    });
  });

  describe('employer FICA and subtotal', () => {
    it('multiplies grossMonthlyPay by the provided FICA rate', () => {
      const result = calculateSalaryTotals(salaried(), 0, FICA_RATE);
      expect(result.employerFica).toBeCloseTo(400);
    });

    it('uses the passed-in FICA rate verbatim (no fallback applied)', () => {
      const result = calculateSalaryTotals(salaried(), 0, 0.0765);
      expect(result.employerFica).toBeCloseTo(382.5);
    });

    it('returns subtotal as the sum of grossMonthlyPay and employerFica', () => {
      const result = calculateSalaryTotals(salaried(), 0.06, FICA_RATE);
      expect(result.subtotal).toBeCloseTo(
        result.grossMonthlyPay + result.employerFica,
      );
    });
  });
});
