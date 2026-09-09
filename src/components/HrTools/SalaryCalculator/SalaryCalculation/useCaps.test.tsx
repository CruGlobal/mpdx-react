import { renderHook, waitFor } from '@testing-library/react';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { useCaps } from './useCaps';

const renderUseCaps = (
  salaryRequestMock: SalaryCalculatorTestWrapperProps['salaryRequestMock'],
  hasSpouse = true,
) =>
  renderHook(() => useCaps(), {
    wrapper: ({ children }) => (
      <SalaryCalculatorTestWrapper
        salaryRequestMock={salaryRequestMock}
        hasSpouse={hasSpouse}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    ),
  });

describe('useCaps', () => {
  it('sums the requested gross salaries', async () => {
    const { result } = renderUseCaps({
      calculations: { requestedGross: 50000, requestedYtdGross: 55000 },
      spouseCalculations: { requestedGross: 30000, requestedYtdGross: 32000 },
    });

    await waitFor(() => expect(result.current.combinedGross).toBe(80000));
  });

  it('sums the requested YTD gross salaries separately from the requested gross', async () => {
    const { result } = renderUseCaps({
      calculations: { requestedGross: 50000, requestedYtdGross: 55000 },
      spouseCalculations: { requestedGross: 30000, requestedYtdGross: 32000 },
    });

    await waitFor(() => expect(result.current.combinedYtdGross).toBe(87000));
  });

  it('sums the effective caps', async () => {
    const { result } = renderUseCaps({
      calculations: { effectiveCap: 60000 },
      spouseCalculations: { effectiveCap: 40000 },
    });

    await waitFor(() =>
      expect(result.current.combinedEffectiveCap).toBe(100000),
    );
  });

  it('ignores the spouse when there is none', async () => {
    const { result } = renderUseCaps(
      { calculations: { requestedGross: 50000, requestedYtdGross: 55000 } },
      false,
    );

    await waitFor(() => expect(result.current.combinedGross).toBe(50000));
    expect(result.current.combinedYtdGross).toBe(55000);
  });

  it('names the person who is over their cap', async () => {
    const { result } = renderUseCaps({
      progressiveApprovalTierReason:
        ProgressiveApprovalTierReasonEnum.OverSpouseCap,
      spouseCalculations: { effectiveCap: 40000 },
    });

    await waitFor(() =>
      expect(result.current.overCapPerson?.effectiveCap).toBe('$40,000.00'),
    );
  });

  it('has no over-cap person when no cap was exceeded', async () => {
    const { result } = renderUseCaps({ progressiveApprovalTierReason: null });

    await waitFor(() => expect(result.current.overCapPerson).toBeNull());
  });
});
