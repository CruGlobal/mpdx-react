import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { useEffectivePaycheckDate } from './useEffectivePaycheckDate';

const wrapperWith = (
  props: Partial<SalaryCalculatorTestWrapperProps> = {},
): React.FC<{ children: React.ReactNode }> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SalaryCalculatorTestWrapper {...props}>
      {children}
    </SalaryCalculatorTestWrapper>
  );
  return Wrapper;
};

const mutationSpy = jest.fn();

describe('useEffectivePaycheckDate', () => {
  it('returns the formatted regularProcessDate when the effective date matches a payroll date', async () => {
    const { result } = renderHook(() => useEffectivePaycheckDate(), {
      wrapper: wrapperWith({
        salaryRequestMock: {
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2026-06-01',
        },
        payrollDates: [
          { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
          { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
        ],
      }),
    });

    await waitFor(() => expect(result.current).toBe('6/10/2026'));
  });

  it('returns null when the effective date is not in the payroll dates list', async () => {
    const { result } = renderHook(() => useEffectivePaycheckDate(), {
      wrapper: wrapperWith({
        salaryRequestMock: {
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2026-06-01',
        },
        payrollDates: [
          { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
        ],
        onCall: mutationSpy,
      }),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PayrollDates'),
    );
    expect(result.current).toBeNull();
  });

  it('returns null when payrollDates is empty', async () => {
    const { result } = renderHook(() => useEffectivePaycheckDate(), {
      wrapper: wrapperWith({
        salaryRequestMock: {
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2026-06-01',
        },
        payrollDates: [],
        onCall: mutationSpy,
      }),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PayrollDates'),
    );
    expect(result.current).toBeNull();
  });

  it('returns null when the calculation has no effective date', async () => {
    const { result } = renderHook(() => useEffectivePaycheckDate(), {
      wrapper: wrapperWith({
        salaryRequestMock: {
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: null,
        },
        payrollDates: [
          { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
        ],
        onCall: mutationSpy,
      }),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PayrollDates'),
    );
    expect(result.current).toBeNull();
  });
});
