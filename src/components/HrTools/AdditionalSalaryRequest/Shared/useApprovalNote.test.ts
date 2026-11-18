import { renderHook } from '@testing-library/react';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useApprovalNote } from './useApprovalNote';

jest.mock('./AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockCalculations = (
  calculations: Record<string, unknown> | undefined,
  spouseCalculations: Record<string, unknown> | null = null,
) =>
  mockUseAdditionalSalaryRequest.mockReturnValue({
    requestData: {
      latestAdditionalSalaryRequest: { calculations, spouseCalculations },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

const capFigures = {
  staffAccountBalance: 1500,
  currentSalaryCap: 56750,
  combinedCap: 150000,
  ytdAsrAmount: 0,
};
const backpayNote =
  "Current year's salary not received doesn't count toward this amount.";

describe('useApprovalNote', () => {
  it.each([
    { person: 'at their cap', gross: 56750, room: 0, amount: '$0.00' },
    {
      person: 'with room left',
      gross: 30000,
      room: 26750,
      amount: '$26,750.00',
    },
  ])(
    'names the amount that needs approval for a person $person',
    ({ gross, room, amount }) => {
      mockCalculations({
        ...capFigures,
        grossAnnualSalary: gross,
        remainingAllowableSalary: room,
      });

      const { result } = renderHook(() => useApprovalNote());

      expect(result.current).toBe(
        `Requests over ${amount} (your remaining allowable salary) need approval. ${backpayNote}`,
      );
    },
  );

  it('names the combined cap when it leaves less room', () => {
    mockCalculations(
      {
        ...capFigures,
        grossAnnualSalary: 30000,
        remainingAllowableSalary: 26750,
        combinedCap: 100000,
      },
      { currentSalaryCap: 60000, grossAnnualSalary: 60000, ytdAsrAmount: 0 },
    );

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBe(
      `Requests over $10,000.00 (what's left under your combined cap with your spouse) need approval. ${backpayNote}`,
    );
  });

  it('says any amount needs approval when the spouse is over their cap', () => {
    mockCalculations(
      {
        ...capFigures,
        grossAnnualSalary: 30000,
        remainingAllowableSalary: 26750,
      },
      { currentSalaryCap: 60000, grossAnnualSalary: 65000, ytdAsrAmount: 0 },
    );

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBe(
      'Any amount needs approval because your spouse is over their cap.',
    );
  });

  it('returns no note without a cap', () => {
    mockCalculations({
      ...capFigures,
      currentSalaryCap: null,
      grossAnnualSalary: 30000,
      remainingAllowableSalary: null,
    });

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBeNull();
  });

  it('returns no note when asked to, as on a submitted request', () => {
    mockCalculations({
      ...capFigures,
      grossAnnualSalary: 30000,
      remainingAllowableSalary: 26750,
    });

    const { result } = renderHook(() => useApprovalNote(false));

    expect(result.current).toBeNull();
  });

  it('returns no note without calculations', () => {
    mockCalculations(undefined);

    const { result } = renderHook(() => useApprovalNote());

    expect(result.current).toBeNull();
  });
});
