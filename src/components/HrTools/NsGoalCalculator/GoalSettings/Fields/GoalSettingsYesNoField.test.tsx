import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import { GoalSettingsYesNoField } from './GoalSettingsYesNoField';

const TestComponent: React.FC<{ initialValue?: 'true' | 'false' }> = ({
  initialValue = 'false',
}) => (
  <ThemeProvider theme={theme}>
    <Formik
      initialValues={{ healthcareExempt: initialValue }}
      onSubmit={jest.fn()}
    >
      {({ values }) => (
        <Form>
          <GoalSettingsYesNoField
            name="healthcareExempt"
            label="Healthcare Exempt"
          />
          <output data-testid="values">{JSON.stringify(values)}</output>
        </Form>
      )}
    </Formik>
  </ThemeProvider>
);

describe('GoalSettingsYesNoField', () => {
  it('renders the current value as Yes/No', () => {
    const { getByRole } = render(<TestComponent initialValue="false" />);

    expect(getByRole('combobox')).toHaveTextContent('No');
  });

  it('stores the selection as a "true"/"false" string, not a boolean', () => {
    const { getByRole, getByTestId } = render(
      <TestComponent initialValue="false" />,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(getByRole('option', { name: 'Yes' }));

    // Quoted value confirms the string is kept (coerced to boolean at submit).
    expect(getByTestId('values')).toHaveTextContent(
      '"healthcareExempt":"true"',
    );
  });
});
