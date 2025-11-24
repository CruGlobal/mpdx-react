import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteForm } from './CompleteForm';

describe('SalaryRequestForm', () => {
  it('renders the form', () => {
    const { getByRole } = render(<CompleteForm />);
    expect(getByRole('heading', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders all fifteen input fields', () => {
    const { getAllByRole } = render(<CompleteForm />);

    expect(getAllByRole('spinbutton')).toHaveLength(15);
  });

  it('updates amount when user enters value', async () => {
    const { getAllByRole, getByLabelText } = render(<CompleteForm />);

    const inputs = getAllByRole('spinbutton');
    userEvent.clear(inputs[0]);
    userEvent.type(inputs[0], '1000');
    userEvent.clear(inputs[1]);
    userEvent.type(inputs[1], '500');

    expect(inputs[0]).toHaveValue(1000);
    expect(inputs[1]).toHaveValue(500);

    expect(getByLabelText('Total requested amount')).toHaveTextContent(
      '$1,500',
    );
  });
});
