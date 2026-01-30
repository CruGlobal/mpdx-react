import { renderHook } from '@testing-library/react';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useFormData } from './useFormData';

jest.mock('./AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

describe('useFormData', () => {
  it('returns staff info and calculated balances', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        additionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 100000,
            staffAccountBalance: 40000,
          },
        },
      },
      user: {
        staffInfo: {
          preferredName: 'Doe, John',
          personNumber: '00123456',
          emailAddress: 'john.doe@example.com',
        },
        currentSalary: {
          grossSalaryAmount: 40000,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormData());

    expect(result.current.name).toBe('Doe, John');
    expect(result.current.accountNumber).toBe('00123456');
    expect(result.current.email).toBe('john.doe@example.com');
    expect(result.current.primaryAccountBalance).toBe(40000);
    // remainingAllowableSalary = currentSalaryCap (100000) - grossSalaryAmount (40000)
    expect(result.current.remainingAllowableSalary).toBe(60000);
  });

  it('defaults balances to 0 when calculations are undefined', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        additionalSalaryRequest: {
          calculations: undefined,
        },
      },
      user: {
        currentSalary: {
          grossSalaryAmount: 40000,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormData());

    expect(result.current.primaryAccountBalance).toBe(0);
    // remainingAllowableSalary = 0 - 40000
    expect(result.current.remainingAllowableSalary).toBe(-40000);
  });

  it('handles undefined user gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        additionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 100000,
            staffAccountBalance: 40000,
          },
        },
      },
      user: undefined,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormData());

    expect(result.current.name).toBeUndefined();
    expect(result.current.accountNumber).toBeUndefined();
    expect(result.current.email).toBeUndefined();
    expect(result.current.primaryAccountBalance).toBe(40000);
    // grossSalaryAmount defaults to 0 when user is undefined
    expect(result.current.remainingAllowableSalary).toBe(100000);
  });

  it('handles undefined requestData gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: undefined,
      user: undefined,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormData());

    expect(result.current.primaryAccountBalance).toBe(0);
    expect(result.current.remainingAllowableSalary).toBe(0);
  });
});
