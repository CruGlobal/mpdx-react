import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TFunction } from 'react-i18next';
import * as yup from 'yup';
import { DebtPaymentField } from './DebtPaymentField';
import { getAmountSchema } from './FinancialDetails';

// In tests t() returns the key, so an identity function yields the English strings asserted below.
const t = ((key: string) => key) as unknown as TFunction;

const requiredError = 'Please enter an amount, or 0 if you have none.';
const guidance =
  'Round to the nearest dollar. Please enter 0 if you have none.';
const question =
  'What is your monthly payment for all of your student loan debt?';

// Reuse the production amount validation so this test can never drift from the real schema.
const schema = yup.object({ payment: getAmountSchema(t) });

const TestComponent: React.FC = () => (
  <DebtPaymentField
    fieldName="payment"
    schema={schema}
    debtType="student loan debt"
    icon={<span data-testid="debt-icon" />}
  />
);

describe('DebtPaymentField', () => {
  it('renders the input with the question as its accessible name and placeholder', () => {
    const { getByRole, getByPlaceholderText } = render(<TestComponent />);

    expect(getByRole('spinbutton', { name: question })).toBeInTheDocument();
    expect(getByPlaceholderText(question)).toBeInTheDocument();
  });

  it('renders the provided icon', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('debt-icon')).toBeInTheDocument();
  });

  it('shows the required error while empty', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(requiredError)).toBeInTheDocument();
  });

  it('shows rounding guidance once a valid amount is entered', () => {
    const { getByRole, getByText, queryByText } = render(<TestComponent />);

    userEvent.type(getByRole('spinbutton', { name: question }), '0');

    expect(getByText(guidance)).toBeInTheDocument();
    expect(queryByText(requiredError)).not.toBeInTheDocument();
  });

  it('rejects a negative amount', () => {
    expect(() => getAmountSchema(t).validateSync('-5')).toThrow(
      'Please enter a positive amount.',
    );
  });

  it('rejects a non-whole-dollar amount', () => {
    expect(() => getAmountSchema(t).validateSync('12.50')).toThrow(
      'Please enter a whole dollar amount.',
    );
  });

  it('accepts a whole-dollar amount and normalizes leading zeros', () => {
    expect(getAmountSchema(t).validateSync('500')).toBe('500');
    expect(getAmountSchema(t).validateSync('007')).toBe('7');
    expect(getAmountSchema(t).validateSync('0')).toBe('0');
  });
});
