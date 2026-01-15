import { render, waitFor } from '@testing-library/react';
import { merge } from 'lodash';
import { DeepPartial } from 'ts-essentials';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import { SalaryCalculationQuery } from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { RequestSummaryCard } from './RequestSummaryCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    calculations: {
      annualBase: 10001,
      requestedSeca: 10002,
      contributing403bAmount: 10003,
      requestedGross: 10004,
      effectiveCap: 10005,
    },
    spouseCalculations: {
      annualBase: 20001,
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
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Your gross request is within your Maximum Allowable Salary.',
    );
  });

  describe('user over cap', () => {
    it('renders status message', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { requestedGross: 40000 },
            spouseCalculations: { effectiveCap: 50000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          "Your Combined Gross Requested Salary is within your Combined Maximum Allowable Salary. \
However, John's Gross Requested Salary exceeds his individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why John's Salary should exceed $40,000.00 in the Additional Information section below \
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
            calculations: { effectiveCap: 50000 },
            spouseCalculations: { requestedGross: 40000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          "Your Combined Gross Requested Salary is within your Combined Maximum Allowable Salary. \
However, Jane's Gross Requested Salary exceeds his individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why Jane's Salary should exceed $40,000.00 in the Additional Information section below \
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
            calculations: { requestedGross: 100_000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
              approver: 'Vice President',
              approvalTimeframe: '1-2 weeks',
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
          'Your Combined Gross Requested Salary exceeds your Combined Maximum Allowable Salary. \
Please make adjustments to your Salary Request above or fill out the Approval Process Section below to request a higher amount through our Progressive Approvals process. \
This may take 1-2 weeks as it needs to be signed off by the Vice President. \
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
        'Combined Gross Salary / Max Allowable Salary$30,008.00 / $30,010.00',
      ),
    );
  });

  it('renders remaining amount', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('RequestSummaryCard-remaining')).toHaveTextContent(
        'Remaining in Combined Max Allowable Salary$2.00',
      ),
    );
  });

  describe('table', () => {
    it('renders table headers', async () => {
      const { getAllByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['Description', 'John', 'Jane']),
      );
    });

    it('renders row headers', async () => {
      const { getAllByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(
          getAllByRole('rowheader').map((cell) => cell.textContent),
        ).toEqual([
          'Requested Salary (includes MHA)',
          'SECA and Related Federal Taxes',
          '403b Contribution',
          'Gross Requested Salary',
          'Maximum Allowable Salary',
        ]),
      );
    });

    it('renders table cells', async () => {
      const { getAllByRole } = render(<TestComponent />);

      const expectedCells = [
        ['$10,001.00', '$20,001.00'],
        ['$10,002.00', '$20,002.00'],
        ['$10,003.00', '$20,003.00'],
        ['$10,004.00', '$20,004.00'],
        ['$10,005.00', '$20,005.00'],
      ].flat();

      await waitFor(() =>
        expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
          expectedCells,
        ),
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
      const { getByTestId, getAllByRole } = render(
        <TestComponent hasSpouse={false} />,
      );

      await waitFor(() =>
        expect(
          getByTestId('RequestSummaryCard-requestedVsMax'),
        ).toHaveTextContent(
          'Your Gross Requested Salary / Max Allowable Salary$10,004.00 / $10,005.00',
        ),
      );

      expect(getByTestId('RequestSummaryCard-remaining')).toHaveTextContent(
        'Remaining in Max Allowable Salary$1.00',
      );

      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(['Description', 'John']);

      expect(getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(
        [
          'Requested Salary (includes MHA)',
          'SECA and Related Federal Taxes',
          '403b Contribution',
          'Gross Requested Salary',
          'Maximum Allowable Salary',
        ],
      );

      expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
        '$10,001.00',
        '$10,002.00',
        '$10,003.00',
        '$10,004.00',
        '$10,005.00',
      ]);
    });

    describe('requires above division head approval', () => {
      it('renders status message', async () => {
        const { getByTestId } = render(
          <TestComponent
            hasSpouse={false}
            salaryRequestMock={{
              calculations: { requestedGross: 100_000 },
              progressiveApprovalTier: {
                tier: ProgressiveApprovalTierEnum.VicePresident,
                approver: 'Vice President',
                approvalTimeframe: '1-2 weeks',
              },
            }}
          />,
        );

        await waitFor(() =>
          expect(getByTestId('RequestSummaryCard-status')).toHaveTextContent(
            'Your Gross Requested Salary exceeds your Maximum Allowable Salary. \
Please make adjustments to your Salary Request above or fill out the Approval Process Section below to request a higher amount through our Progressive Approvals process. \
This may take 1-2 weeks as it needs to be signed off by the Vice President. \
This may affect your selected effective date.',
          ),
        );
      });
    });
  });
});
