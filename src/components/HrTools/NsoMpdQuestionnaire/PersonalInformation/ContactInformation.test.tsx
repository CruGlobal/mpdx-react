import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { ContactInformation } from './ContactInformation';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <ContactInformation />
  </ThemeProvider>
);

describe('ContactInformation', () => {
  it('renders the cell phone number field', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('textbox', { name: 'Cell Phone Number' }),
    ).toBeInTheDocument();
  });

  it('marks the cell phone number field as required', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Cell Phone Number' })).toBeRequired();
  });

  it('strips disallowed characters as the user types', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, 'abc(123) 456-7890xyz');

    expect(input).toHaveValue('(123) 456-7890');
  });

  it('shows a validation error for too few digits on blur', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, '123');
    userEvent.tab();

    expect(getByText('Invalid phone number')).toBeInTheDocument();
  });

  it('accepts a valid number without error', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, '(123) 456-7890');
    userEvent.tab();

    expect(queryByText('Invalid phone number')).not.toBeInTheDocument();
  });
});
