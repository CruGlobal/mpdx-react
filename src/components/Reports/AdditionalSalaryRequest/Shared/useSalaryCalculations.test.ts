import React, { createElement } from 'react';
import { renderHook } from '@testing-library/react';
import { Formik } from 'formik';
import { ElectionType403bEnum } from 'src/graphql/types.generated';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import {
  AT_CAP_TOLERANCE,
  useSalaryCalculations,
} from './useSalaryCalculations';

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
    electionType403b: ElectionType403bEnum.None,
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
      electionType403b: ElectionType403bEnum.Standard,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(10000); // 5000 + 3000 + 2000
    expect(result.current.calculatedTraditionalDeduction).toBe(1200); // 10000 * 0.12
    expect(result.current.calculatedRothDeduction).toBe(1000); // 10000 * 0.10
    expect(result.current.totalDeduction).toBe(2200); // 1200 + 1000
    expect(result.current.netSalary).toBe(7800); // 10000 - 2200
    expect(result.current.totalAnnualSalary).toBe(10000); // No calculations data, so just total
  });

  it('calculates all salary values correctly with default percentage disabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '10000',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(10000); // 10000
    expect(result.current.calculatedTraditionalDeduction).toBe(0);
    expect(result.current.calculatedRothDeduction).toBe(0);
    expect(result.current.totalDeduction).toBe(0);
    expect(result.current.netSalary).toBe(10000); // 10000 - 0
  });

  it('calculates traditional deduction when radio selected', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      electionType403b: ElectionType403bEnum.Pretax,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(5000);
    expect(result.current.calculatedTraditionalDeduction).toBe(5000); // 100% of total
    expect(result.current.totalDeduction).toBe(5000);
    expect(result.current.netSalary).toBe(0); // 5000 - 5000
  });

  it('calculates roth deduction when radio selected', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      electionType403b: ElectionType403bEnum.Roth,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(5000);
    expect(result.current.calculatedRothDeduction).toBe(5000); // 100% of total
    expect(result.current.totalDeduction).toBe(5000);
    expect(result.current.netSalary).toBe(0); // 5000 - 5000
  });

  it('excludes roth deduction from total calculation', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '2000',
      electionType403b: ElectionType403bEnum.Pretax,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    // Should not include pretax deduction in total
    expect(result.current.total).toBe(3000); // 1000 + 2000
  });

  it('excludes pretax deduction from total calculation', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '2000',
      electionType403b: ElectionType403bEnum.Roth,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    // Should not include pretax deduction in total
    expect(result.current.total).toBe(3000); // 1000 + 2000
  });

  it('handles all fields with values', () => {
    const values: CompleteFormValues = {
      currentYearSalaryNotReceived: '1000',
      previousYearSalaryNotReceived: '1000',
      additionalSalaryWithinMax: '1000',
      adoption: '1000',
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
      electionType403b: ElectionType403bEnum.None,
      phoneNumber: '',
      emailAddress: '',
      totalAdditionalSalaryRequested: '15000',
      additionalInfo: '',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(14000); // 14 fields * 1000
    expect(result.current.calculatedTraditionalDeduction).toBe(0);
    expect(result.current.calculatedRothDeduction).toBe(0);
    expect(result.current.totalDeduction).toBe(0);
    expect(result.current.netSalary).toBe(14000); // 14000 - 0
  });

  it('handles zero values correctly', () => {
    const values: CompleteFormValues = {
      ...baseValues,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(0);
    expect(result.current.calculatedTraditionalDeduction).toBe(0);
    expect(result.current.calculatedRothDeduction).toBe(0);
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
          calculations: {
            currentSalaryCap: 5000,
            pendingAsrAmount: 1000,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '2000',
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
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
          calculations: {
            currentSalaryCap: 10000,
            pendingAsrAmount: 10000,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '30000',
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsr).toBe(true);
      expect(result.current.splitAsrType).toBe('spouse');
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBe('user');
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
      expect(result.current.splitAsrType).toBe('user');
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
      expect(result.current.additionalApproval).toBe(true);
    });

    it('Staff Member over cap, spouse exactly $5 below cap — treated as at cap', () => {
      const currentSalaryCap = 40000 + AT_CAP_TOLERANCE;
      setupOverCap({ currentSalaryCap, pendingAsrAmount: 0 });

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
      expect(result.current.splitAsrType).toBeNull();
      expect(result.current.additionalApproval).toBe(true);
    });

    it('Staff Member over cap, spouse $6 below cap — not at cap, splitAsr', () => {
      const currentSalaryCap = 40000 + AT_CAP_TOLERANCE + 1;
      setupOverCap({ currentSalaryCap, pendingAsrAmount: 0 });

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
      expect(result.current.splitAsrType).toBe('user');
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
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
      // No room to increase — needs approval, not split
      expect(result.current.exceedsCap).toBe(false);
      expect(result.current.splitAsr).toBe(false);
      expect(result.current.splitAsrType).toBeNull();
      expect(result.current.additionalApproval).toBe(true);
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
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
      expect(result.current.splitAsrType).toBeNull();
      expect(result.current.additionalApproval).toBe(true);
    });
  });

  describe('spouse cap fields', () => {
    it('returns spouse total, cap, and remaining when spouse has room', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: { currentSalary: { grossSalaryAmount: 40000 } },
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: { currentSalaryCap: 60000 },
            spouseCalculations: {
              currentSalaryCap: 50000,
              pendingAsrAmount: 2000,
            },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const values: CompleteFormValues = { ...baseValues };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      expect(result.current.spouseCap).toEqual({
        totalAnnualSalary: 42000, // 40000 + 2000
        individualCap: 50000,
        remainingCap: 8000, // 50000 - 42000
      });
    });

    it('clamps spouseRemainingCap at 0 when spouse total exceeds cap', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: { currentSalary: { grossSalaryAmount: 40000 } },
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: { currentSalaryCap: 60000 },
            spouseCalculations: {
              currentSalaryCap: 50000,
              pendingAsrAmount: 15000,
            },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const values: CompleteFormValues = { ...baseValues };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      expect(result.current.spouseCap).toEqual({
        totalAnnualSalary: 55000,
        individualCap: 50000,
        remainingCap: 0,
      });
    });

    it('returns null for all spouse fields when no spouse', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        traditional403bPercentage: 0.12,
        roth403bPercentage: 0.1,
        user: { currentSalary: { grossSalaryAmount: 50000 } },
        spouse: undefined,
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: { currentSalaryCap: 60000 },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const values: CompleteFormValues = { ...baseValues };

      const { result } = renderHook(() => useSalaryCalculations({ values }), {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      });

      expect(result.current.spouseCap).toBeNull();
    });
  });
});
