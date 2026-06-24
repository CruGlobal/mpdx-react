import { render, renderHook, waitFor } from '@testing-library/react';
import {
  ProgressiveApprovalTierEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import { progressiveApprovalsLink } from '../../AdditionalSalaryRequest/Shared/pdfLinks';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { useSubmitDialogContent } from './useSubmitDialogContent';

describe('useSubmitDialogContent', () => {
  it('returns standard submit content when no approval is required', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: null,
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.title).toBe(
        'Are you ready to submit your Salary Calculation Form?',
      );
    });
    expect(result.current.content).toBe(
      'You are submitting your Salary Calculation Form.',
    );
    expect(result.current.subContent).toBe(
      'Your request will be sent to HR Services.',
    );
  });

  it('returns standard submit content when tier is DivisionHead', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
              approvalTimeframe: '1 week',
              approver: 'Division Head',
            },
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    });

    await waitFor(() =>
      expect(result.current.subContent).toBe(
        'Your request will be sent to HR Services.',
      ),
    );
  });

  it('returns approval required content when progressive approval tier is not DivisionHead', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
              approvalTimeframe: '2-3 weeks',
              approver: 'Vice President',
            },
            calculations: {
              requestedGross: 50000,
            },
            spouseCalculations: {
              requestedGross: 30000,
            },
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.title).toBe(
        'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to continue?',
      );
    });

    const { container, getByRole } = render(
      <div>{result.current.subContent}</div>,
    );

    expect(container).toHaveTextContent('$80,000.00');
    expect(container).toHaveTextContent('2-3 weeks');
    expect(container).toHaveTextContent('Vice President');
    expect(
      getByRole('link', { name: 'Progressive Approvals' }),
    ).toHaveAttribute('href', progressiveApprovalsLink);
  });

  it('returns board cap exception content when the reason is BoardCapException', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.BoardCompensationCommittee,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.BoardCapException,
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.title).toBe(
        'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to continue?',
      );
    });
    expect(result.current.content).toBe(
      'Requests exceeding your Maximum Allowable Salary require additional review.',
    );
    expect(result.current.subContent).toContain(
      'You have a Board approved Maximum Allowable Salary (CAP)',
    );
    expect(result.current.subContent).toContain(
      "We'll forward your request to them and get back to you with their decision",
    );
  });

  it('returns overlapping requests content when the reason is OverlappingRequests', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.ManagementCompensationCommittee,
              approvalTimeframe: '2 weeks',
              approver: 'MCC',
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverlappingRequests,
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.title).toBe(
        'Your request requires additional approval. Do you want to continue?',
      );
    });
    expect(result.current.subContent).toContain(
      'pending Additional Salary Request',
    );
    expect(result.current.subContent).toContain('2 weeks');
    expect(result.current.subContent).toContain('MCC');
  });
});
