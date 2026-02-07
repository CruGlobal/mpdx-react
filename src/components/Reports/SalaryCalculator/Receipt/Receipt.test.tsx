import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { ReceiptStep } from './Receipt';

interface TestComponentProps {
  boardCapException?: boolean;
  requiresApproval?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  boardCapException = false,
  requiresApproval = false,
}) => (
  <SalaryCalculatorTestWrapper
    hcmMock={{ exceptionSalaryCap: { boardCapException } }}
    salaryRequestMock={
      requiresApproval
        ? {
            calculations: { requestedGross: 100000 },
            spouseCalculations: { requestedGross: 40000 },
            progressiveApprovalTier: {
              approver: 'Division Head',
              approvalTimeframe: '1-2 weeks',
            },
          }
        : undefined
    }
  >
    <ReceiptStep />
  </SalaryCalculatorTestWrapper>
);

describe('Receipt step', () => {
  it('should show approval info when user has board cap exception', async () => {
    const { getByTestId } = render(<TestComponent boardCapException />);

    await waitFor(() =>
      expect(getByTestId('Receipt-message')).toHaveTextContent(
        "You have a Board approved Maximum Allowable Salary (CAP) \
and the salary request you submitted exceeds that amount. \
As a result we need to get their approval for this request. \
We'll forward your request to them and get back to you with their decision.",
      ),
    );
  });

  it('should show approval info when request requires approval', async () => {
    const { getByTestId } = render(<TestComponent requiresApproval />);

    await waitFor(() =>
      expect(getByTestId('Receipt-message')).toHaveTextContent(
        'Because your request exceeds your maximum allowable salary it will require additional approvals. \
For the $140,000.00 you are requesting, this will take 1-2 weeks as it needs to be signed off by the Division Head. \
This may affect your selected effective date. We will review your request through our Progressive Approvals process and notify you of any changes to the status of this request.',
      ),
    );
  });

  it('should show summary when user clicks to view receipt', async () => {
    const { getByText, findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: /View or print/ }));
    expect(getByText('New Salary Calculation Summary')).toBeInTheDocument();
  });
});
