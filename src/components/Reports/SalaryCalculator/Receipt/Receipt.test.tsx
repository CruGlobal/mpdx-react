import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { ReceiptStep } from './Receipt';

interface TestComponentProps {
  requiresApproval?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  requiresApproval = false,
}) => (
  <SalaryCalculatorTestWrapper
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
        : null
    }
  >
    <ReceiptStep />
  </SalaryCalculatorTestWrapper>
);

describe('Receipt step', () => {
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

  it('should show summary when user clicks to view receipt', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /View or print/ }));
    expect(getByText('New Salary Calculation Summary')).toBeInTheDocument();
  });
});
