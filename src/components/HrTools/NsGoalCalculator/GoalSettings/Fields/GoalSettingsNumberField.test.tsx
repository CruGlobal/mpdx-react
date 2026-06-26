import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import {
  GoalSettingsNumberField,
  GoalSettingsNumberFieldProps,
} from './GoalSettingsNumberField';

const TestComponent: React.FC<{
  fieldProps?: Partial<GoalSettingsNumberFieldProps>;
  initialValue?: number | '';
}> = ({ fieldProps, initialValue = '' }) => (
  <ThemeProvider theme={theme}>
    <Formik initialValues={{ amount: initialValue }} onSubmit={jest.fn()}>
      {({ values }) => (
        <Form>
          <GoalSettingsNumberField
            name="amount"
            label="Amount"
            {...fieldProps}
          />
          <output data-testid="values">{JSON.stringify(values)}</output>
        </Form>
      )}
    </Formik>
  </ThemeProvider>
);

describe('GoalSettingsNumberField', () => {
  it('renders a numeric input', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('spinbutton', { name: 'Amount' })).toBeInTheDocument();
  });

  it('coerces the typed value to a number in Formik state', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);

    userEvent.type(getByRole('spinbutton', { name: 'Amount' }), '42');

    // Number, not the string "42" — Formik coerces via type="number".
    expect(getByTestId('values')).toHaveTextContent('"amount":42');
  });

  it('renders a currency adornment', () => {
    const { getByText } = render(
      <TestComponent fieldProps={{ adornment: 'currency' }} />,
    );

    expect(getByText('$')).toBeInTheDocument();
  });

  it('renders a percentage adornment', () => {
    const { getByText } = render(
      <TestComponent fieldProps={{ adornment: 'percentage' }} />,
    );

    expect(getByText('%')).toBeInTheDocument();
  });

  it('renders no adornment by default', () => {
    const { queryByText } = render(<TestComponent />);

    expect(queryByText('$')).not.toBeInTheDocument();
    expect(queryByText('%')).not.toBeInTheDocument();
  });
});
