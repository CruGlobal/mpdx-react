import { renderHook } from '@testing-library/react';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useApprovalNote } from './useApprovalNote';

jest.mock('./AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockThreshold = (
  approvalThreshold: number | null,
  approvalThresholdReason: ProgressiveApprovalTierReasonEnum | null,
) =>
  mockUseAdditionalSalaryRequest.mockReturnValue({
    requestData: {
      latestAdditionalSalaryRequest: {
        calculations: { approvalThreshold, approvalThresholdReason },
      },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

const backpayNote =
  "Current year's salary not received doesn't count toward this amount.";

describe('useApprovalNote', () => {
  it.each([
    { person: 'at their cap', threshold: 0, amount: '$0.00' },
    { person: 'with room left', threshold: 26750, amount: '$26,750.00' },
  ])(
    'names the amount that needs approval for a person $person',
    ({ threshold, amount }) => {
      mockThreshold(threshold, ProgressiveApprovalTierReasonEnum.OverUserCap);

      const { result } = renderHook(() => useApprovalNote());

      expect(result.current).toBe(
        `Requests over ${amount} (your remaining allowable salary) need approval. ${backpayNote}`,
      );
    },
  );

  it('names the combined cap when the API says it leaves less room', () => {
    mockThreshold(10000, ProgressiveApprovalTierReasonEnum.OverCombinedCap);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBe(
      `Requests over $10,000.00 (what's left under your combined cap with your spouse) need approval. ${backpayNote}`,
    );
  });

  it('says any amount needs approval when the spouse is over their cap', () => {
    mockThreshold(0, ProgressiveApprovalTierReasonEnum.OverSpouseCap);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBe(
      'Any amount needs approval because your spouse is over their cap.',
    );
  });

  it('returns no note when the API sends no threshold', () => {
    mockThreshold(null, null);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBeNull();
  });

  it('returns no note for a reason that names no cap', () => {
    mockThreshold(5000, ProgressiveApprovalTierReasonEnum.BoardCapException);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBeNull();
  });

  it('returns no note when asked to, as on a submitted request', () => {
    mockThreshold(26750, ProgressiveApprovalTierReasonEnum.OverUserCap);

    const { result } = renderHook(() => useApprovalNote(false));

    expect(result.current).toBeNull();
  });

  it('returns no note without calculations', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: { calculations: undefined },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBeNull();
  });
});
