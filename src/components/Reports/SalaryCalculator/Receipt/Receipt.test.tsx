import { render } from '@testing-library/react';
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
      requiresApproval ? { calculations: { requestedGross: 100000 } } : null
    }
  >
    <ReceiptStep />
  </SalaryCalculatorTestWrapper>
);

describe('Receipt step', () => {
  it('should show approval info when request requires approval', async () => {
    const { findByText } = render(<TestComponent requiresApproval />);

    expect(
      await findByText(
        'it needs to be signed off by Approver Name and Other Approver',
        { exact: false },
      ),
    ).toBeInTheDocument();
  });

  it('should show summary when user clicks to view receipt', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /View or print/ }));
    expect(getByText('New Salary Calculation Summary')).toBeInTheDocument();
  });
});
