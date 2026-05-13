import { render, waitFor } from '@testing-library/react';
import { UserPersonTypeEnum } from 'pages/api/graphql-rest.page.generated';
import {
  ProgressiveApprovalTierEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
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
      const { getByRole, getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { effectiveCap: 30000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverUserCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('ApprovalProcessCard-status')).toHaveTextContent(
          "John's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why John's Salary should exceed $30,000.00 for division head approval below.",
        ),
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });

  describe('spouse over cap', () => {
    it('renders status message and textfield', async () => {
      const { getByRole, getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            spouseCalculations: { effectiveCap: 30000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.DivisionHead,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverSpouseCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('ApprovalProcessCard-status')).toHaveTextContent(
          "Jane's Gross Requested Salary exceeds their individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why Jane's Salary should exceed $30,000.00 for division head approval below.",
        ),
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });

  describe('SOSA blockOnCap', () => {
    const sosaUser = {
      staffInfo: {
        userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse,
      },
    };
    const overCapMock = {
      progressiveApprovalTier: {
        tier: ProgressiveApprovalTierEnum.VicePresident,
      },
    };

    it('renders nothing when the SOSA user is over their effective cap', async () => {
      const { queryByRole } = render(
        <TestComponent hcmUser={sosaUser} salaryRequestMock={overCapMock} />,
      );

      await waitFor(() =>
        expect(queryByRole('textbox')).not.toBeInTheDocument(),
      );
    });

    it('renders the card when the user is not SOSA, even if over cap', async () => {
      const { findByRole } = render(
        <TestComponent salaryRequestMock={overCapMock} />,
      );

      expect(
        await findByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });

  describe('combined over cap', () => {
    it('renders single status message and textfield', async () => {
      const { getByRole, getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            spouseCalculations: null,
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverCombinedCap,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('ApprovalProcessCard-status')).toHaveTextContent(
          'Since you are requesting above your Maximum Allowable Salary, you will need to provide the information below.',
        ),
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });

    it('renders married status message', async () => {
      const { getByRole, getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { requestedGross: 100_000 },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('ApprovalProcessCard-status')).toHaveTextContent(
          "Since you are requesting above Jane's and your combined Maximum Allowable Salary, you will need to provide the information below.",
        ),
      );
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });
  });
});
