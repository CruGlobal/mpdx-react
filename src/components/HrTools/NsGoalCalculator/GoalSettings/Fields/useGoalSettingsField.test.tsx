import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import { GoalSettingsTextField } from './GoalSettingsTextField';
import { GoalSettingsFieldBaseProps } from './useGoalSettingsField';

// Exercises the hook through a real consumer (GoalSettingsTextField).
const TestComponent: React.FC<GoalSettingsFieldBaseProps> = (props) => (
  <ThemeProvider theme={theme}>
    <Formik initialValues={{ [props.name]: '' }} onSubmit={jest.fn()}>
      <Form>
        <GoalSettingsTextField {...props} />
      </Form>
    </Formik>
  </ThemeProvider>
);

describe('useGoalSettingsField', () => {
  it('uses the label as the accessible name for a shared field', () => {
    const { getByRole } = render(<TestComponent name="age" label="Age" />);

    expect(getByRole('textbox', { name: 'Age' })).toBeInTheDocument();
  });

  it('appends personName to the accessible name for a per-person field', () => {
    const { getByRole } = render(
      <TestComponent name="age" label="Age" personName="John" />,
    );

    expect(getByRole('textbox', { name: 'Age — John' })).toBeInTheDocument();
  });

  it('does not render the label as a visible MUI label', () => {
    const { container } = render(<TestComponent name="age" label="Age" />);

    // The Category column shows the label; the field itself renders none.
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders a visible MUI label when showLabel is set', () => {
    const { container, getByRole } = render(
      <TestComponent name="age" label="Age" showLabel />,
    );

    expect(container.querySelector('label')).toHaveTextContent('Age');
    // The visible label provides the accessible name, so no aria-label.
    expect(getByRole('textbox', { name: 'Age' })).not.toHaveAttribute(
      'aria-label',
    );
  });

  it('lets caller-supplied inputProps override the derived aria-label', () => {
    const { getByRole } = render(
      <TestComponent
        name="age"
        label="Age"
        inputProps={{ 'aria-label': 'Custom name' }}
      />,
    );

    expect(getByRole('textbox', { name: 'Custom name' })).toBeInTheDocument();
  });

  it('surfaces the Formik error as helperText once the field is touched', () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <Formik
          initialValues={{ age: '' }}
          initialErrors={{ age: 'Age is required' }}
          initialTouched={{ age: true }}
          onSubmit={jest.fn()}
        >
          <Form>
            <GoalSettingsTextField name="age" label="Age" />
          </Form>
        </Formik>
      </ThemeProvider>,
    );

    expect(getByRole('textbox', { name: 'Age' })).toBeInvalid();
    expect(getByText('Age is required')).toBeInTheDocument();
  });

  it('hides the error until the field is touched', () => {
    const { getByRole, queryByText } = render(
      <ThemeProvider theme={theme}>
        <Formik
          initialValues={{ age: '' }}
          initialErrors={{ age: 'Age is required' }}
          onSubmit={jest.fn()}
        >
          <Form>
            <GoalSettingsTextField name="age" label="Age" />
          </Form>
        </Formik>
      </ThemeProvider>,
    );

    expect(getByRole('textbox', { name: 'Age' })).toBeValid();
    expect(queryByText('Age is required')).not.toBeInTheDocument();
  });
});
