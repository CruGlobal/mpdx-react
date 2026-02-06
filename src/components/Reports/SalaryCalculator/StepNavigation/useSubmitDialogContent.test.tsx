import { renderHook, waitFor } from '@testing-library/react';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryRequestMock,
} from '../SalaryCalculatorTestWrapper';
import { useSubmitDialogContent } from './useSubmitDialogContent';

interface TestWrapperProps {
  salaryRequestMock?: SalaryRequestMock;
  hcmUser?: {
    exceptionSalaryCap?: { amount?: number; boardCapException?: boolean };
  };
  children?: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  salaryRequestMock,
  hcmUser,
  children,
}) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={salaryRequestMock}
    hcmUser={hcmUser}
  >
    {children}
  </SalaryCalculatorTestWrapper>
);

describe('useSubmitDialogContent', () => {
  it('returns standard submit content when no approval is required', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <TestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: null,
          }}
          hcmUser={{
            exceptionSalaryCap: { boardCapException: false },
          }}
        >
          {children}
        </TestWrapper>
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
        <TestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
              approvalTimeframe: '1 week',
              approver: 'Division Head',
            },
          }}
          hcmUser={{
            exceptionSalaryCap: { boardCapException: false },
          }}
        >
          {children}
        </TestWrapper>
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
        <TestWrapper
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
          hcmUser={{
            exceptionSalaryCap: { boardCapException: false },
          }}
        >
          {children}
        </TestWrapper>
      ),
    });

    await waitFor(() => {
      expect(result.current.title).toBe(
        'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to continue?',
      );
    });

    expect(result.current.subContent).toContain('$80,000.00');
    expect(result.current.subContent).toContain('2-3 weeks');
    expect(result.current.subContent).toContain('Vice President');
  });

  it('returns board cap exception content when user has exception salary cap', async () => {
    const { result } = renderHook(() => useSubmitDialogContent(), {
      wrapper: ({ children }) => (
        <TestWrapper
          salaryRequestMock={{
            progressiveApprovalTier: null,
          }}
          hcmUser={{
            exceptionSalaryCap: { boardCapException: true },
          }}
        >
          {children}
        </TestWrapper>
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
});
