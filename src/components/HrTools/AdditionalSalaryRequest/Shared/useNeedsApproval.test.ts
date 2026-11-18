import { renderHook } from '@testing-library/react';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from './CompleteForm.mock';
import { exceedsApprovalThreshold, useNeedsApproval } from './useNeedsApproval';

jest.mock('./AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

describe('exceedsApprovalThreshold', () => {
  it.each([
    { nonBackpayTotal: 10000, threshold: 10000, expected: false },
    { nonBackpayTotal: 10000.01, threshold: 10000, expected: true },
    { nonBackpayTotal: 1, threshold: 0, expected: true },
    { nonBackpayTotal: 0, threshold: 0, expected: false },
    { nonBackpayTotal: 50000, threshold: null, expected: false },
    { nonBackpayTotal: 50000, threshold: undefined, expected: false },
  ])(
    'is $expected for $nonBackpayTotal against a threshold of $threshold',
    ({ nonBackpayTotal, threshold, expected }) => {
      expect(exceedsApprovalThreshold(threshold, nonBackpayTotal)).toBe(
        expected,
      );
    },
  );
});

describe('useNeedsApproval', () => {
  beforeEach(() => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: {
            approvalThreshold: 10000,
            approvalThresholdReason:
              ProgressiveApprovalTierReasonEnum.OverCombinedCap,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
  });

  it("is true when the request's non-backpay total is over the API's threshold", () => {
    const { result } = renderHook(() =>
      useNeedsApproval({
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '12000',
      }),
    );

    expect(result.current).toBe(true);
  });

  it('leaves current-year backpay out', () => {
    const { result } = renderHook(() =>
      useNeedsApproval({
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '8000',
        currentYearSalaryNotReceived: '50000',
      }),
    );

    expect(result.current).toBe(false);
  });
});
