import { render, waitFor } from '@testing-library/react';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { ApprovalProcessCard } from './ApprovalProcessCard';

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper {...props}>
    <ApprovalProcessCard />
  </SalaryCalculatorTestWrapper>
);

describe('ApprovalProcessCard', () => {
  it('renders nothing when not over cap', async () => {
    const { queryByRole } = render(<TestComponent />);

    await waitFor(() => expect(queryByRole('textbox')).not.toBeInTheDocument());
  });

  describe('user over cap', () => {
    it('renders status message and textfield', async () => {
      const { getByRole, findByTestId } = render(
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

      expect(
        await findByTestId('ApprovalProcessCard-status'),
      ).toHaveTextContent(
        "John's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why John's Salary should exceed $40,000.00 or make changes to your Requested Salary above.",
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });

  describe('spouse over cap', () => {
    it('renders status message and textfield', async () => {
      const { getByRole, findByTestId } = render(
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

      expect(
        await findByTestId('ApprovalProcessCard-status'),
      ).toHaveTextContent(
        "Jane's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why Jane's Salary should exceed $40,000.00 or make changes to your Requested Salary above.",
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });

  describe('combined over cap', () => {
    it('renders status message and textfield', async () => {
      const { getByRole, findByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { requestedGross: 100_000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
            },
          }}
        />,
      );

      expect(
        await findByTestId('ApprovalProcessCard-status'),
      ).toHaveTextContent(
        "Since you are requesting above your and Jane's combined Maximum Allowable Salary, you will need to provide the information below.",
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });
});
