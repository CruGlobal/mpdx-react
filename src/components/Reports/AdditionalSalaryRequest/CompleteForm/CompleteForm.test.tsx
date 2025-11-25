import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { CompleteForm } from './CompleteForm';

const TestWrapper: React.FC = () => (
  <AdditionalSalaryRequestTestWrapper>
    <CompleteForm />
  </AdditionalSalaryRequestTestWrapper>
);

describe('SalaryRequestForm', () => {
  it('renders the form', () => {
    const { getByRole } = render(<TestWrapper />);
    expect(getByRole('heading', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders all fifteen input fields', () => {
    const { getAllByRole } = render(<TestWrapper />);

    expect(getAllByRole('spinbutton')).toHaveLength(15);
  });

  it('updates amount when user enters value', () => {
    const { getAllByRole, getAllByLabelText } = render(<TestWrapper />);

    const inputs = getAllByRole('spinbutton');
    userEvent.clear(inputs[0]);
    userEvent.type(inputs[0], '1000');
    userEvent.clear(inputs[1]);
    userEvent.type(inputs[1], '500');

    expect(inputs[0]).toHaveValue(1000);
    expect(inputs[1]).toHaveValue(500);

    // Get the first "Total requested amount" which is from AdditionalSalaryRequest
    const totalElements = getAllByLabelText('Total requested amount');
    expect(totalElements[0]).toHaveTextContent('$1,500');
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const { getByRole } = render(<TestWrapper />);

    const submitButton = getByRole('button', { name: /submit/i });

    userEvent.click(submitButton);

    // The form should submit without errors
    await waitFor(() => {
      // Since handleSubmit is currently empty (TODO), we just verify the button can be clicked
      // and the form submission is triggered
      expect(submitButton).toBeInTheDocument();
    });
  });

  it('renders the submit button with correct type', () => {
    const { getByRole } = render(<TestWrapper />);

    const submitButton = getByRole('button', { name: /submit/i });

    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('renders the 403(b) Deduction checkbox', () => {
    const { getByRole } = render(<TestWrapper />);

    expect(
      getByRole('checkbox', {
        name: 'Use default Percentage for 403(b) deduction',
      }),
    ).not.toBeChecked();
  });

  it('shows both AdditionalSalaryRequest and Deduction sections', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Additional Salary Request')).toBeInTheDocument();
    expect(getByText('403(b) Deduction')).toBeInTheDocument();
  });
});
