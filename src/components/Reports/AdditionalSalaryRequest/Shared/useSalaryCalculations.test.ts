import React, { createElement } from 'react';
import { renderHook } from '@testing-library/react';
import { Formik } from 'formik';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useSalaryCalculations } from './useSalaryCalculations';

jest.mock('./AdditionalSalaryRequestContext');

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

beforeEach(() => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    traditional403bPercentage: 0.12,
    roth403bPercentage: 0.1,
    user: undefined,
  } as ReturnType<typeof useAdditionalSalaryRequest>);
});

const FormikWrapper = ({
  children,
  values,
}: {
  children: React.ReactNode;
  values: CompleteFormValues;
}) =>
  createElement(
    Formik,
    { initialValues: values, onSubmit: () => {} },
    children,
  );

describe('useSalaryCalculations', () => {
  const baseValues: CompleteFormValues = {
    currentYearSalaryNotReceived: '0',
    previousYearSalaryNotReceived: '0',
    additionalSalaryWithinMax: '0',
    adoption: '0',
    traditional403bContribution: '0',
    roth403bContribution: '0',
    counselingNonMedical: '0',
    healthcareExpensesExceedingLimit: '0',
    babysittingMinistryEvents: '0',
    childrenMinistryTripExpenses: '0',
    childrenCollegeEducation: '0',
    movingExpense: '0',
    seminary: '0',
    housingDownPayment: '0',
    autoPurchase: '0',
    expensesNotApprovedWithin90Days: '0',
    deductTaxDeferredPercent: false,
    deductRothPercent: false,
    phoneNumber: '',
    emailAddress: '',
    totalAdditionalSalaryRequested: '0',
    additionalInfo: '',
  };

  it('calculates all salary values correctly with default percentage enabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      previousYearSalaryNotReceived: '3000',
      adoption: '2000',
      traditional403bContribution: '1000',
      roth403bContribution: '100',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(11100); // 5000 + 3000 + 2000 + 1000 + 100
    // Deductions are based on totalWithout403b (10000 = 5000 + 3000 + 2000)
    expect(result.current.calculatedTraditionalDeduction).toBe(1200); // 10000 * 0.12
    // Roth is based on totalWithout403b minus traditional deduction: (10000 - 1200) * 0.10
    expect(result.current.calculatedRothDeduction).toBe(880); // 8800 * 0.10
    expect(result.current.contribution403b).toBe(1100);
    expect(result.current.totalDeduction).toBe(3180); // (1200 + 880) + 1100
    expect(result.current.netSalary).toBe(7920); // 11100 - 3180
    expect(result.current.totalAnnualSalary).toBe(11100); // No calculations data, so just total
  });

  it('calculates all salary values correctly with default percentage disabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '10000',
      traditional403bContribution: '500',
      roth403bContribution: '500',
      deductTaxDeferredPercent: false,
      deductRothPercent: false,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(11000); // 10000 + 1000
    expect(result.current.calculatedTraditionalDeduction).toBe(0);
    expect(result.current.calculatedRothDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(1000);
    expect(result.current.totalDeduction).toBe(1000);
    expect(result.current.netSalary).toBe(10000); // 11000 - 1000
  });

  it('handles empty traditional403bContribution value', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      deductTaxDeferredPercent: true,
      traditional403bContribution: '',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(5000);
    expect(result.current.calculatedTraditionalDeduction).toBe(600); // 5000 * 0.12
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(600);
    expect(result.current.netSalary).toBe(4400); // 5000 - 600
  });

  it('handles empty roth403bContribution value', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      deductRothPercent: true,
      roth403bContribution: '',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(5000);
    expect(result.current.calculatedRothDeduction).toBe(500); // 5000 * 0.10
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(500);
    expect(result.current.netSalary).toBe(4500); // 5000 - 500
  });

  it('excludes deductTaxDeferredPercent from total calculation', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '2000',
      deductTaxDeferredPercent: true,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    // Should not include deductTaxDeferredPercent boolean in total
    expect(result.current.total).toBe(3000); // 1000 + 2000
  });

  it('excludes deductRothPercent from total calculation', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '2000',
      deductRothPercent: true,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    // Should not include deductRothPercent boolean in total
    expect(result.current.total).toBe(3000); // 1000 + 2000
  });

  it('handles all fields with values', () => {
    const values: CompleteFormValues = {
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '1000',
      additionalSalaryWithinMax: '1000',
      adoption: '1000',
      traditional403bContribution: '1000',
      roth403bContribution: '1000',
      counselingNonMedical: '1000',
      healthcareExpensesExceedingLimit: '1000',
      babysittingMinistryEvents: '1000',
      childrenMinistryTripExpenses: '1000',
      childrenCollegeEducation: '1000',
      movingExpense: '1000',
      seminary: '1000',
      housingDownPayment: '1000',
      autoPurchase: '1000',
      expensesNotApprovedWithin90Days: '1000',
      deductTaxDeferredPercent: false,
      deductRothPercent: false,
      phoneNumber: '',
      emailAddress: '',
      totalAdditionalSalaryRequested: '15000',
      additionalInfo: '',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(16000); // 16 fields * 1000
    expect(result.current.calculatedTraditionalDeduction).toBe(0); // deductTaxDeferredPercent is false
    expect(result.current.calculatedRothDeduction).toBe(0); // deductRothPercent is false
    expect(result.current.contribution403b).toBe(2000);
    expect(result.current.totalDeduction).toBe(2000);
    expect(result.current.netSalary).toBe(14000); // 16000 - 2000
  });

  it('handles zero values correctly', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      deductTaxDeferredPercent: false,
      deductRothPercent: false,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(0);
    expect(result.current.calculatedTraditionalDeduction).toBe(0);
    expect(result.current.calculatedRothDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(0);
    expect(result.current.netSalary).toBe(0);
    expect(result.current.totalAnnualSalary).toBe(0);
  });

  it('calculates totalAnnualSalary and exceedsCap under cap with calculations data', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      traditional403bPercentage: 0.12,
      roth403bPercentage: 0.1,
      user: {
        currentSalary: { grossSalaryAmount: 1000 },
      },
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: { currentSalaryCap: 5000 },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '2000',
    };

    const calculations = {
      pendingAsrAmount: 1000,
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
          calculations,
        }),
      {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      },
    );

    expect(result.current.total).toBe(2000);
    // totalAnnualSalary = grossAnnualSalary + additionalSalaryReceivedThisYear + total
    // = 1000 + 1000 + 2000 = 4000
    expect(result.current.totalAnnualSalary).toBe(4000);
    // totalAnnualSalary (4000) <= individualCap (5000)
    expect(result.current.exceedsCap).toBe(false);
  });

  it('handles exceedsCap when over max', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      traditional403bPercentage: 0.12,
      roth403bPercentage: 0.1,
      user: {
        currentSalary: { grossSalaryAmount: 50000 },
      },
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: { currentSalaryCap: 10000 },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '30000',
    };

    const calculations = {
      pendingAsrAmount: 10000,
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
          calculations,
        }),
      {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      },
    );

    expect(result.current.total).toBe(30000);
    // totalAnnualSalary = 50000 + 10000 + 30000 = 90000
    expect(result.current.totalAnnualSalary).toBe(90000);
    // total (30000) > individualCap (10000)
    expect(result.current.exceedsCap).toBe(true);
  });

  describe('Married - Staff Member under cap', () => {
    // Cases 1-4: Staff Member under cap — nothing triggers regardless of spouse status
    const setupUnderCap = (spouseCalculations: {
      currentSalaryCap: number;
      pendingAsrAmount: number;
    }) => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: { currentSalary: { grossSalaryAmount: 40000 } },
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: 70000,
            },
            spouseCalculations,
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
    };

    it('Staff Member under cap, spouse has no pending ASR', () => {
      setupUnderCap({ currentSalaryCap: 50000, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 5000 = 55000 < 70000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member under cap, spouse has ASR under their cap', () => {
      setupUnderCap({ currentSalaryCap: 50000, pendingAsrAmount: 5000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 < 70000, Spouse: 45000 < 50000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member under cap, spouse is over their cap', () => {
      setupUnderCap({ currentSalaryCap: 50000, pendingAsrAmount: 15000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 < 70000, Spouse: 55000 > 50000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member under cap, spouse is at their cap', () => {
      setupUnderCap({ currentSalaryCap: 40003, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 < 70000, Spouse: 40000 within $5 of 40003 (at cap)
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });
  });

  describe('Married - Staff Member over cap', () => {
    const setupOverCap = (spouseCalculations: {
      currentSalaryCap: number;
      pendingAsrAmount: number;
    }) => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: { currentSalary: { grossSalaryAmount: 40000 } },
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: 60000,
            },
            spouseCalculations,
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
    };

    it('Staff Member over cap, spouse has no pending ASR — splitAsr', () => {
      setupOverCap({ currentSalaryCap: 50000, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 15000 = 65000 > 60000 (exceeds)
      // Spouse: 40000 + 0 = 40000 < 50000 (under cap)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(true);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member over cap, spouse has ASR under their cap — splitAsr', () => {
      setupOverCap({ currentSalaryCap: 50000, pendingAsrAmount: 5000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 65000 > 60000 (exceeds)
      // Spouse: 40000 + 5000 = 45000 < 50000 (under cap)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(true);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member over cap, spouse is over their cap — additionalApproval', () => {
      setupOverCap({ currentSalaryCap: 50000, pendingAsrAmount: 15000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 65000 > 60000 (exceeds)
      // Spouse: 40000 + 15000 = 55000 > 50000 (exceeds)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(true);
    });

    it('Staff Member over cap, spouse is at their cap — additionalApproval', () => {
      setupOverCap({ currentSalaryCap: 40003, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 65000 > 60000 (exceeds)
      // Spouse: 40000 within $5 of 40003 (at cap)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(true);
    });

    it('Staff Member over cap, spouse exactly $5 below cap — treated as at cap', () => {
      setupOverCap({ currentSalaryCap: 40005, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 65000 > 60000 (exceeds)
      // Spouse: 40000, cap = 40005, difference = $5 (inclusive boundary — at cap)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(true);
    });

    it('Staff Member over cap, spouse $6 below cap — not at cap, splitAsr', () => {
      setupOverCap({ currentSalaryCap: 40006, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 65000 > 60000 (exceeds)
      // Spouse: 40000, cap = 40006, difference = $6 (outside tolerance — not at cap)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(true);
      expect(result.current.additionalApproval).toBe(false);
    });
  });

  describe('Married - Staff Member at cap', () => {
    // Cases 9-12: Staff Member at cap (not over) — nothing triggers
    const setupAtCap = (spouseCalculations: {
      currentSalaryCap: number;
      pendingAsrAmount: number;
    }) => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: { currentSalary: { grossSalaryAmount: 40000 } },
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: 55000,
            },
            spouseCalculations,
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
    };

    it('Staff Member at cap, spouse has no pending ASR', () => {
      setupAtCap({ currentSalaryCap: 50000, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 5000 = 55000 = 55000 (at cap, not over)
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member at cap, spouse has ASR under their cap', () => {
      setupAtCap({ currentSalaryCap: 50000, pendingAsrAmount: 5000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 = 55000 (at cap), Spouse: 45000 < 50000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member at cap, spouse is over their cap', () => {
      setupAtCap({ currentSalaryCap: 50000, pendingAsrAmount: 15000 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 = 55000 (at cap), Spouse: 55000 > 50000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member at cap, spouse is at their cap', () => {
      setupAtCap({ currentSalaryCap: 40003, pendingAsrAmount: 0 });

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 55000 = 55000 (at cap), Spouse: 40000 within $5 of 40003
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });
  });

  describe('Single staff member', () => {
    const setupSingle = (cap: number) => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: undefined,
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: { currentSalaryCap: cap },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
    };

    it('Staff Member under cap — nothing triggers', () => {
      setupSingle(70000);

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 5000 = 55000 < 70000
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member at cap — nothing triggers', () => {
      setupSingle(55000);

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '5000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 5000 = 55000 = 55000 (at cap, not over)
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(false);
    });

    it('Staff Member over cap — additionalApproval', () => {
      setupSingle(60000);

      const values: CompleteFormValues = {
        ...baseValues,
        currentYearSalaryNotReceived: '15000',
      };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      // Staff Member: 50000 + 0 + 15000 = 65000 > 60000 (exceeds)
      expect(result.current.exceedsCap).toBe(true);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.additionalApproval).toBe(true);
    });
  });
});
