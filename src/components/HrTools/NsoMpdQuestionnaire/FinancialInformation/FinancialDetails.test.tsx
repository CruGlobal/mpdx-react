import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { FinancialDetails } from './FinancialDetails';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <FinancialDetails />
  </ThemeProvider>
);

const studentLoanQuestion =
  'What is your monthly payment for all of your student loan debt?';
const carQuestion = 'What is your monthly payment for all of your car debt?';
const creditCardQuestion =
  'What is your monthly payment for all of your credit card debt?';
const requiredError = 'Please enter an amount, or 0 if you have none.';

describe('FinancialDetails', () => {
  it('renders the debt question with Yes and No options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Do you have any student loan, car, or credit card debt?',
      }),
    ).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Yes' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'No' })).toBeInTheDocument();
  });

  it('hides the payment fields until Yes is selected', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('spinbutton', { name: studentLoanQuestion }),
    ).not.toBeInTheDocument();
  });

  it('reveals all three payment fields when Yes is selected', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));

    expect(
      getByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: carQuestion })).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: creditCardQuestion }),
    ).toBeInTheDocument();
  });

  it('hides the payment fields again when switching to No', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));
    expect(
      getByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('radio', { name: 'No' }));
    expect(
      queryByRole('spinbutton', { name: studentLoanQuestion }),
    ).not.toBeInTheDocument();
  });

  it('shows a required error on each empty payment field', () => {
    const { getByRole, getAllByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));

    expect(getAllByText(requiredError)).toHaveLength(3);
  });

  it('accepts 0 as a valid amount', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));
    userEvent.type(getByRole('spinbutton', { name: studentLoanQuestion }), '0');
    userEvent.type(getByRole('spinbutton', { name: carQuestion }), '0');
    userEvent.type(getByRole('spinbutton', { name: creditCardQuestion }), '0');

    expect(queryByText(requiredError)).not.toBeInTheDocument();
  });
});
