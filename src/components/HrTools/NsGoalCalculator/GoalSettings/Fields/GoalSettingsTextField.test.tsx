import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import { GoalSettingsTextField } from './GoalSettingsTextField';

const TestComponent: React.FC<{ initialValue?: string }> = ({
  initialValue = '',
}) => (
  <ThemeProvider theme={theme}>
    <Formik initialValues={{ location: initialValue }} onSubmit={jest.fn()}>
      {({ values }) => (
        <Form>
          <GoalSettingsTextField name="location" label="Location" />
          <output data-testid="values">{JSON.stringify(values)}</output>
        </Form>
      )}
    </Formik>
  </ThemeProvider>
);

describe('GoalSettingsTextField', () => {
  it('renders the initial Formik value', () => {
    const { getByRole } = render(<TestComponent initialValue="Orlando, FL" />);

    expect(getByRole('textbox', { name: 'Location' })).toHaveValue(
      'Orlando, FL',
    );
  });

  it('writes the typed string to Formik state', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);

    userEvent.type(getByRole('textbox', { name: 'Location' }), 'Denver');

    expect(getByTestId('values')).toHaveTextContent('"location":"Denver"');
  });
});
