import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { ReceiptStep } from './Receipt';

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper {...props}>
    <ReceiptStep />
  </SalaryCalculatorTestWrapper>
);

describe('Receipt step', () => {
  describe('board cap exception', () => {
    const hcmMock = { exceptionSalaryCap: { boardCapException: true } };

    it('should show approval info when require requires approval', async () => {
      const { getByTestId } = render(
        <TestComponent
          hcmUser={hcmMock}
          salaryRequestMock={{ progressiveApprovalTier: {} }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('Receipt-message')).toHaveTextContent(
          "You have a Board approved Maximum Allowable Salary (CAP) \
and your salary request exceeds that amount. \
As a result we need to get their approval for this request. \
We'll forward your request to them and get back to you with their decision.",
        ),
      );
    });

    it('should not show approval info when request does not require approval', async () => {
      const { getByTestId } = render(
        <TestComponent
          hcmUser={hcmMock}
          salaryRequestMock={{ progressiveApprovalTier: null }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('Receipt-message')).toHaveTextContent(
          'It will be processed by HR Services within the next 2-3 business days. Please print a copy for your records.',
        ),
      );
    });
  });

  describe('no board cap exception', () => {
    it('should show approval info when request requires approval', async () => {
      const { getByTestId } = render(
        <TestComponent
          salaryRequestMock={{
            calculations: { requestedGross: 100000 },
            spouseCalculations: { requestedGross: 40000 },
            progressiveApprovalTier: {
              approver: 'Division Head',
              approvalTimeframe: '1-2 weeks',
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('Receipt-message')).toHaveTextContent(
          'Because your request exceeds your maximum allowable salary it will require additional approvals. \
For the $140,000.00 you are requesting, this will take 1-2 weeks as it needs to be signed off by the Division Head. \
This may affect your selected effective date. We will review your request through our Progressive Approvals process and notify you of any changes to the status of this request.',
        ),
      );
    });

    it('should not show approval info when request does not require approval', async () => {
      const { getByTestId } = render(
        <TestComponent salaryRequestMock={{ progressiveApprovalTier: null }} />,
      );

      await waitFor(() =>
        expect(getByTestId('Receipt-message')).toHaveTextContent(
          'It will be processed by HR Services within the next 2-3 business days. Please print a copy for your records.',
        ),
      );
    });
  });

  it('should show summary when user clicks to view receipt', async () => {
    const { getByText, findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: /View or print/ }));
    expect(getByText('New Salary Calculation Summary')).toBeInTheDocument();
  });
});
