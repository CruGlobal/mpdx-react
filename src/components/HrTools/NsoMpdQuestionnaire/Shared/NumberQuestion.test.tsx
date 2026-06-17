import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import theme from 'src/theme';
import { NumberQuestion } from './NumberQuestion';

const schema = yup.object({
  count: yup
    .string()
    .matches(/^\d+$/, 'Please enter a whole number.')
    .required('Please enter a number.'),
});

const TestComponent: React.FC<{ startAdornment?: React.ReactNode }> = ({
  startAdornment,
}) => (
  <ThemeProvider theme={theme}>
    <NumberQuestion
      fieldName="count"
      schema={schema}
      question="How many?"
      helperText="Enter 0 if none."
      startAdornment={startAdornment}
    />
  </ThemeProvider>
);

describe('NumberQuestion', () => {
  it('renders the numeric input', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('spinbutton', { name: 'How many?' })).toBeInTheDocument();
  });

  it('replaces the helper text with the validation error while empty', () => {
    const { getByText, queryByText } = render(<TestComponent />);

    expect(getByText('Please enter a number.')).toBeInTheDocument();
    expect(queryByText('Enter 0 if none.')).not.toBeInTheDocument();
  });

  it('shows the validation error for an invalid, non-empty value', () => {
    const { getByRole, getByText, queryByText } = render(<TestComponent />);

    userEvent.type(getByRole('spinbutton', { name: 'How many?' }), '-5');

    expect(getByText('Please enter a whole number.')).toBeInTheDocument();
    expect(queryByText('Please enter a number.')).not.toBeInTheDocument();
    expect(queryByText('Enter 0 if none.')).not.toBeInTheDocument();
  });

  it('links the input to its helper text via aria-describedby', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const describedBy = getByRole('spinbutton', {
      name: 'How many?',
    }).getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(getByText('Please enter a number.')).toHaveAttribute(
      'id',
      describedBy,
    );
  });

  it('restores the helper text once a valid value is entered', () => {
    const { getByRole, getByText, queryByText } = render(<TestComponent />);

    userEvent.type(getByRole('spinbutton', { name: 'How many?' }), '0');

    expect(getByText('Enter 0 if none.')).toBeInTheDocument();
    expect(queryByText('Please enter a number.')).not.toBeInTheDocument();
  });

  it('renders a provided start adornment', () => {
    const { getByTestId } = render(
      <TestComponent startAdornment={<span data-testid="adornment" />} />,
    );

    expect(getByTestId('adornment')).toBeInTheDocument();
  });
});
