import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { NeedsApprovalModal } from './NeedsApprovalModal';

const mutationSpy = jest.fn();

interface TestComponentProps {
  handleClose?: () => void;
  handleConfirm?: () => void;
  deadlineDate?: string;
  amount?: string;
  timeFrame?: string;
  approvers?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  handleClose = () => {},
  handleConfirm = () => {},
  deadlineDate = '2025-12-31',
  amount = '$50,000',
  timeFrame = '2 weeks',
  approvers = 'Director and VP',
}) => (
  <ThemeProvider theme={theme}>
    <NeedsApprovalModal
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      deadlineDate={deadlineDate}
      amount={amount}
      timeFrame={timeFrame}
      approvers={approvers}
    />
  </ThemeProvider>
);

describe('NeedsApprovalModal', () => {
  it('should render the needs approval modal with correct content', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('dialog')).toBeInTheDocument();
    expect(
      getByRole('heading', {
        name: 'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to submit it for approval?',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Requests exceeding your Maximum Allowable Salary require additional review.',
      ),
    ).toBeInTheDocument();
  });

  it('should display the progressive approvals link', () => {
    const { getByRole } = render(<TestComponent />);

    const link = getByRole('link', { name: 'Progressive Approvals' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://staffweb.cru.org/pay-benefits-staff-expenses/payroll/salary-calculation/progressive-approvals.html',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should display dynamic values in content', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('$50,000', { exact: false })).toBeInTheDocument();
    expect(getByText('2 weeks', { exact: false })).toBeInTheDocument();
    expect(getByText('Director and VP', { exact: false })).toBeInTheDocument();
  });

  it('should call handleClose when go back button is clicked', async () => {
    const { getByRole } = render(<TestComponent handleClose={mutationSpy} />);

    const goBackButton = getByRole('button', { name: 'GO BACK' });
    userEvent.click(goBackButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });

  it('should call handleConfirm when continue button is clicked', async () => {
    const { getByRole } = render(
      <TestComponent handleConfirm={mutationSpy} />,
    );

    const continueButton = getByRole('button', { name: 'Yes, Continue' });
    userEvent.click(continueButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });
});
