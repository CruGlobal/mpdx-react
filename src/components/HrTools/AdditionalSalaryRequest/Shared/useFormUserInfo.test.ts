import { renderHook } from '@testing-library/react';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useFormUserInfo } from './useFormUserInfo';

jest.mock('./AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

describe('useFormUserInfo', () => {
  it('returns staff info and calculated balances', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 100000,
            grossAnnualSalary: 60000,
            ytdAsrAmount: 15000,
            staffAccountBalance: 40000,
            staffAccountDeficitLimit: 15000,
            unpaidHouseholdAsrAmount: 10000,
            unpaidHouseholdAsrs: [
              {
                amount: 10000,
                status: 'PENDING',
                submittedAt: null,
                spouse: true,
              },
            ],
            availableStaffAccountBalance: 45000,
            remainingAllowableSalary: 5000,
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

    const { result } = renderHook(() => useFormUserInfo());

    expect(result.current.name).toBe('Doe, John');
    expect(result.current.email).toBe('john.doe@example.com');
    expect(result.current.availableAccountBalance).toBe(45000);
    expect(result.current.overBalanceMessage).toBe(
      'Exceeds the $45,000.00 available for this request (balance plus deficit limit, minus $10,000.00 in other unpaid requests).',
    );
    expect(result.current.balanceBreakdown).toEqual({
      balance: 40000,
      deficitLimit: 15000,
      unpaidTotal: 10000,
      unpaidRequests: [
        { amount: 10000, status: 'PENDING', submittedAt: null, spouse: true },
      ],
    });
    expect(result.current.remainingCap).toBe(5000);
  });

  it('defaults balances to 0 and remaining to null when calculations are undefined', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: undefined,
        },
      },
      user: {
        currentSalary: {
          grossSalaryAmount: 40000,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormUserInfo());

    expect(result.current.availableAccountBalance).toBe(0);
    expect(result.current.balanceBreakdown).toBeNull();
    expect(result.current.remainingCap).toBeNull();
  });

  it('handles undefined user gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 100000,
            staffAccountBalance: 40000,
          },
        },
      },
      user: undefined,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormUserInfo());

    expect(result.current.name).toBeUndefined();
    expect(result.current.email).toBeUndefined();
    expect(result.current.balanceBreakdown).toEqual({
      balance: 40000,
      deficitLimit: 0,
      unpaidTotal: 0,
      unpaidRequests: [],
    });
  });

  it('handles undefined requestData gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: undefined,
      user: undefined,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useFormUserInfo());

    expect(result.current.balanceBreakdown).toBeNull();
  });
});
