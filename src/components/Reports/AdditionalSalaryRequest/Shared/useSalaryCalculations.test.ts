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
    phoneNumber: '',
    totalAdditionalSalaryRequested: '0',
    emailAddress: '',
    additionalInfo: '',
  };

  it('calculates all salary values correctly with default percentage enabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
      previousYearSalaryNotReceived: '3000',
      adoption: '2000',
      traditional403bContribution: '1000',
      deductTaxDeferredPercent: true,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(11000); // 5000 + 3000 + 2000 + 1000
    expect(result.current.calculatedDeduction).toBe(1320); // 11000 * 0.12
    expect(result.current.contribution403b).toBe(1000);
    expect(result.current.totalDeduction).toBe(2320); // 1320 + 1000
    expect(result.current.netSalary).toBe(8680); // 11000 - 2320
    expect(result.current.totalAnnualSalary).toBe(11000); // No calculations data, so just total
    expect(result.current.remainingInMaxAllowable).toBe(-11000); // 0 - 11000
  });

  it('calculates all salary values correctly with default percentage disabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '10000',
      traditional403bContribution: '500',
      deductTaxDeferredPercent: false,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(10500); // 10000 + 500
    expect(result.current.calculatedDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(500);
    expect(result.current.totalDeduction).toBe(500);
    expect(result.current.netSalary).toBe(10000); // 10500 - 500
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
    expect(result.current.calculatedDeduction).toBe(600); // 5000 * 0.12
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(600);
    expect(result.current.netSalary).toBe(4400); // 5000 - 600
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
      phoneNumber: '',
      totalAdditionalSalaryRequested: '15000',
      emailAddress: '',
      additionalInfo: '',
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(15000); // 15 fields * 1000
    expect(result.current.calculatedDeduction).toBe(0); // deductTaxDeferredPercent is false
    expect(result.current.contribution403b).toBe(1000);
    expect(result.current.totalDeduction).toBe(1000);
    expect(result.current.netSalary).toBe(14000); // 15000 - 1000
  });

  it('handles zero values correctly', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      deductTaxDeferredPercent: false,
    };

    const { result } = renderHook(() => useSalaryCalculations({ values }), {
      wrapper: ({ children }) => FormikWrapper({ children, values }),
    });

    expect(result.current.total).toBe(0);
    expect(result.current.calculatedDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(0);
    expect(result.current.netSalary).toBe(0);
    expect(result.current.totalAnnualSalary).toBe(0);
    expect(result.current.remainingInMaxAllowable).toBe(0);
  });

  it('calculates totalAnnualSalary and remainingInMaxAllowable with calculations data', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '5000',
    };

    const calculations = {
      maxAmountAndReason: { amount: 100000 },
      pendingAsrAmount: 10000,
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
          calculations,
          grossSalaryAmount: 50000,
        }),
      {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      },
    );

    expect(result.current.total).toBe(5000);
    // totalAnnualSalary = grossAnnualSalary + additionalSalaryReceivedThisYear + total
    // = 50000 + 10000 + 5000 = 65000
    expect(result.current.totalAnnualSalary).toBe(65000);
    // remainingInMaxAllowable = maxAllowableSalary - totalAnnualSalary
    // = 100000 - 65000 = 35000
    expect(result.current.remainingInMaxAllowable).toBe(35000);
  });

  it('handles negative remainingInMaxAllowable when over max', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalaryNotReceived: '30000',
    };

    const calculations = {
      maxAmountAndReason: { amount: 80000 },
      pendingAsrAmount: 10000,
    };

    const { result } = renderHook(
      () =>
        useSalaryCalculations({
          values,
          calculations,
          grossSalaryAmount: 50000,
        }),
      {
        wrapper: ({ children }) => FormikWrapper({ children, values }),
      },
    );

    expect(result.current.total).toBe(30000);
    // totalAnnualSalary = 50000 + 10000 + 30000 = 90000
    expect(result.current.totalAnnualSalary).toBe(90000);
    // remainingInMaxAllowable = 80000 - 90000 = -10000
    expect(result.current.remainingInMaxAllowable).toBe(-10000);
  });
});
