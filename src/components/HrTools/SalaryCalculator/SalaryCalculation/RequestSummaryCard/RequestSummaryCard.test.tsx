import { render, waitFor } from '@testing-library/react';
import { merge } from 'lodash';
import { DeepPartial } from 'ts-essentials';
import {
  ProgressiveApprovalTierEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import { SalaryCalculationQuery } from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { RequestSummaryCard } from './RequestSummaryCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    salary: 10001,
    spouseSalary: 20001,
    calculations: {
      requestedSeca: 10002,
      contributing403bAmount: 10003,
      requestedGross: 10004,
      effectiveCap: 10005,
      combinedCap: 10006,
    },
    spouseCalculations: {
      requestedSeca: 20002,
      contributing403bAmount: 20003,
      requestedGross: 20004,
      effectiveCap: 20005,
    },
  };

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper
    {...props}
    salaryRequestMock={merge({}, defaultSalaryMock, props.salaryRequestMock)}
  >
    <RequestSummaryCard />
  </SalaryCalculatorTestWrapper>
);

describe('RequestSummaryCard', () => {
  it('renders status message', async () => {
    const { findByTestId } = render(<TestComponent />);

    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Your gross request is within your Maximum Allowable Salary.',
    );
  });

  describe('board cap exception', () => {
    it('renders status message and textfield', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.BoardCapException,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          "You have a Board approved Maximum Allowable Salary (CAP) \
and your salary request exceeds that amount. \
As a result we need to get their approval for this request. \
We'll forward your request to them and get back to you with their decision.",
        ),
      );
    });

    it('renders status message when request does not require approval', async () => {
      const { findByTestId } = render(
        <TestComponent salaryRequestMock={{ progressiveApprovalTier: null }} />,
      );

      expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
        'Your gross request is within your Maximum Allowable Salary.',
      );
    });
  });

  describe('overlapping requests', () => {
    it('renders overlap message when reason is OverlappingRequests', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.ManagementCompensationCommittee,
              approver: 'MCC',
              approvalTimeframe: '2 weeks',
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverlappingRequests,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          'You or your spouse has a pending Additional Salary Request, so this request needs additional approval. \
This will take 2 weeks as it needs to be signed off by the MCC. This may affect your selected effective date.',
        ),
      );
    });
  });

  describe('user over cap', () => {
    it('renders status message', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverUserCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          "Your Combined Gross Requested Salary is within your Combined Maximum Allowable Salary. \
However, John's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why John's Requested Salary should exceed $10,005.00 in the Additional Information section below \
or make changes to how your Requested Salary is distributed above.",
        ),
      );
    });
  });

  describe('spouse over cap', () => {
    it('renders status message', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverSpouseCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          "Your Combined Gross Requested Salary is within your Combined Maximum Allowable Salary. \
However, Jane's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why Jane's Requested Salary should exceed $20,005.00 in the Additional Information section below \
or make changes to how your Requested Salary is distributed above.",
        ),
      );
    });
  });

  describe('requires above division head approval', () => {
    it('renders status message', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
              approver: 'Vice President',
              approvalTimeframe: '1-2 weeks',
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverCombinedCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          'Your Combined Gross Requested Salary exceeds your Combined Maximum Allowable Salary. \
Please make adjustments to your Salary Request above or fill out the Approval Process Section below to request a higher amount through our Progressive Approvals process. \
This will take 1-2 weeks as it needs to be signed off by the Vice President. \
This may affect your selected effective date.',
        ),
      );
    });
  });

  it('renders requested amount', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(
        getByTestId('RequestSummaryCard-requestedVsMax'),
      ).toHaveTextContent(
        'Combined Gross Salary / Max Allowable Salary$30,008.00 / $10,006.00',
      ),
    );
  });

  it('renders remaining amount', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('RequestSummaryCard-remaining')).toHaveTextContent(
        'Remaining in Combined Max Allowable Salary-$20,002.00',
      ),
    );
  });

  describe('table', () => {
    it('renders table headers, row headers, and cells', async () => {
      const { getByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Description', 'John', 'Jane'],
          rowHeaders: [
            'Requested Salary (includes MHA)',
            'SECA and Related Federal Taxes',
            '403b Contribution',
            'Gross Requested Salary',
            'Maximum Allowable Salary',
          ],
          cells: [
            ['$10,001.00', '$20,001.00'],
            ['$10,002.00', '$20,002.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            ['$10,005.00', '$20,005.00'],
          ],
        }),
      );
    });

    it('shows SECA opt-out text', async () => {
      const { findByText, getByText } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { secaEstimatedFraction: 0 },
            spouseCalculations: { secaEstimatedFraction: 0 },
          }}
        />,
      );

      expect(
        await findByText('John has opted out of SECA'),
      ).toBeInTheDocument();
      expect(getByText('Jane has opted out of SECA')).toBeInTheDocument();
    });
  });

  describe('single user', () => {
    it('modifies labels and hides table cells', async () => {
      const { getByTestId, getByRole } = render(
        <TestComponent hasSpouse={false} />,
      );

      await waitFor(() =>
        expect(
          getByTestId('RequestSummaryCard-requestedVsMax'),
        ).toHaveTextContent(
          'Your Gross Requested Salary / Max Allowable Salary$10,004.00 / $10,006.00',
        ),
      );

      expect(getByTestId('RequestSummaryCard-remaining')).toHaveTextContent(
        'Remaining in Max Allowable Salary$2.00',
      );

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Description', 'John'],
          rowHeaders: [
            'Requested Salary (includes MHA)',
            'SECA and Related Federal Taxes',
            '403b Contribution',
            'Gross Requested Salary',
            'Maximum Allowable Salary',
          ],
          cells: [
            '$10,001.00',
            '$10,002.00',
            '$10,003.00',
            '$10,004.00',
            '$10,005.00',
          ],
        }),
      );
    });

    describe('requires above division head approval', () => {
      it('renders status message', async () => {
        const { getByTestId } = render(
          <TestComponent
            hasSpouse={false}
            salaryRequestMock={{
              progressiveApprovalTier: {
                tier: ProgressiveApprovalTierEnum.VicePresident,
                approver: 'Vice President',
                approvalTimeframe: '1-2 weeks',
              },
              progressiveApprovalTierReason:
                ProgressiveApprovalTierReasonEnum.OverCombinedCap,
            }}
          />,
        );

        await waitFor(() =>
          expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
            'Your Gross Requested Salary exceeds your Maximum Allowable Salary. \
Please make adjustments to your Salary Request above or fill out the Approval Process Section below to request a higher amount through our Progressive Approvals process. \
This will take 1-2 weeks as it needs to be signed off by the Vice President. \
This may affect your selected effective date.',
          ),
        );
      });
    });
  });
});
