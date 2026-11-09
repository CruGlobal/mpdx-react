import { render, waitFor } from '@testing-library/react';
import {
  ProgressiveApprovalTierEnum,
  ProgressiveApprovalTierReasonEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import {
  HcmLoaded,
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

    const renderSosa = (requestedYtdGross: number, hcmUser?: typeof sosaUser) =>
      render(
        <SalaryCalculatorTestWrapper
          hasSpouse={false}
          hcmUser={hcmUser}
          salaryRequestMock={{
            calculations: {
              effectiveCap: 75000,
              hardCap: 90000,
              requestedYtdGross,
            },
            progressiveApprovalTier: {
              tier: ProgressiveApprovalTierEnum.VicePresident,
            },
            progressiveApprovalTierReason:
              ProgressiveApprovalTierReasonEnum.OverUserCap,
          }}
        >
          <HcmLoaded />
          <ApprovalProcessCard />
        </SalaryCalculatorTestWrapper>,
      );

    it('renders the card when the SOSA user is over their effective cap but within their hard cap', async () => {
      const { findByText, getByRole } = renderSosa(82000, sosaUser);

      expect(await findByText('HCM loaded')).toBeInTheDocument();
      expect(
        getByRole('textbox', { name: 'Additional info' }),
      ).toBeInTheDocument();
    });

    it('renders nothing when the SOSA user is over their hard cap', async () => {
      const { findByText, queryByRole } = renderSosa(90001, sosaUser);

      expect(await findByText('HCM loaded')).toBeInTheDocument();
      expect(queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('renders the card when the user is not SOSA, even if over their hard cap', async () => {
      const { findByText, getByRole } = renderSosa(90001);

      expect(await findByText('HCM loaded')).toBeInTheDocument();
      expect(
        getByRole('textbox', { name: 'Additional info' }),
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
