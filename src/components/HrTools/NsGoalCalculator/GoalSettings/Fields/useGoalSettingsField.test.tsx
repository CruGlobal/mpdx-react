import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { NewStaffGoalCalculationSalaryOverCapEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { defaultGoalCalculation } from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsPreviewProvider } from '../GoalSettingsPreviewContext';
import { calculationToFormValues } from '../goalSettingsApiMapping';
import { GoalSettingsFormValues } from '../goalSettingsFormValues';
import { GoalSettingsTextField } from './GoalSettingsTextField';
import { GoalSettingsFieldBaseProps } from './useGoalSettingsField';

interface TestComponentProps extends GoalSettingsFieldBaseProps {
  initialErrors?: FormikErrors<GoalSettingsFormValues>;
  initialTouched?: FormikTouched<GoalSettingsFormValues>;
  savedSalaryOverCap?: boolean;
  allowSalaryOverCap?: NewStaffGoalCalculationSalaryOverCapEnum;
  secaExempt?: GoalSettingsFormValues['secaExempt'];
  spouseSecaExempt?: GoalSettingsFormValues['spouseSecaExempt'];
}

// Exercises the hook through a real consumer (GoalSettingsTextField).
const TestComponent: React.FC<TestComponentProps> = ({
  initialErrors,
  initialTouched,
  savedSalaryOverCap = false,
  allowSalaryOverCap = NewStaffGoalCalculationSalaryOverCapEnum.No,
  secaExempt = 'false',
  spouseSecaExempt = 'false',
  ...fieldProps
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider>
      <Formik
        initialValues={{
          ...calculationToFormValues(defaultGoalCalculation),
          allowSalaryOverCap,
          secaExempt,
          spouseSecaExempt,
        }}
        initialErrors={initialErrors}
        initialTouched={initialTouched}
        onSubmit={jest.fn()}
      >
        <GoalSettingsPreviewProvider
          accountListId="account-list-1"
          calculationId={defaultGoalCalculation.id}
          savedSalaryOverCap={savedSalaryOverCap}
          savedDebtOverCap={false}
        >
          <Form>
            <GoalSettingsTextField {...fieldProps} />
          </Form>
        </GoalSettingsPreviewProvider>
      </Formik>
    </GqlMockedProvider>
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
      <TestComponent
        name="age"
        label="Age"
        initialErrors={{ age: 'Age is required' }}
        initialTouched={{ age: true }}
      />,
    );

    expect(getByRole('textbox', { name: 'Age' })).toBeInvalid();
    expect(getByText('Age is required')).toBeInTheDocument();
  });

  it('hides the error until the field is touched', () => {
    const { getByRole, queryByText } = render(
      <TestComponent
        name="age"
        label="Age"
        initialErrors={{ age: 'Age is required' }}
      />,
    );

    expect(getByRole('textbox', { name: 'Age' })).toBeValid();
    expect(queryByText('Age is required')).not.toBeInTheDocument();
  });

  it('outlines a contributing field in the warning color when allowed', () => {
    const { container } = render(
      <TestComponent
        name="annualRequestedSalary"
        label="Salary"
        savedSalaryOverCap
        allowSalaryOverCap={NewStaffGoalCalculationSalaryOverCapEnum.YesAny}
      />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).toHaveStyle({ borderColor: theme.palette.warning.main });
  });

  it('outlines a contributing field in the error color when not allowed', () => {
    const { container } = render(
      <TestComponent
        name="annualRequestedSalary"
        label="Salary"
        savedSalaryOverCap
      />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).toHaveStyle({ borderColor: theme.palette.error.main });
  });

  it('leaves fields that do not feed the warning alone', () => {
    const { container } = render(
      <TestComponent name="tenure" label="Tenure" savedSalaryOverCap />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).not.toHaveStyle({ borderColor: theme.palette.error.main });
  });

  it('does not outline anything while the cap is not exceeded', () => {
    const { container } = render(
      <TestComponent name="annualRequestedSalary" label="Salary" />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).not.toHaveStyle({ borderColor: theme.palette.error.main });
  });

  it('lets a validation error take over the field', () => {
    const { getByRole, getByText } = render(
      <TestComponent
        name="annualRequestedSalary"
        label="Salary"
        savedSalaryOverCap
        initialErrors={{ annualRequestedSalary: 'Salary is required' }}
        initialTouched={{ annualRequestedSalary: true }}
      />,
    );

    expect(getByRole('textbox', { name: 'Salary' })).toBeInvalid();
    expect(getByText('Salary is required')).toBeInTheDocument();
  });

  it('outlines the exemption field the warning came from', () => {
    const { container } = render(
      <TestComponent name="secaExempt" label="SECA Exempt" secaExempt="true" />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).toHaveStyle({ borderColor: theme.palette.warning.main });
  });

  it('leaves the spouse exemption field alone when only staff opted out', () => {
    const { container } = render(
      <TestComponent
        name="spouseSecaExempt"
        label="SECA Exempt"
        secaExempt="true"
      />,
    );

    expect(
      container.querySelector('.MuiOutlinedInput-notchedOutline'),
    ).not.toHaveStyle({ borderColor: theme.palette.warning.main });
  });

  it('does not mark a highlighted field invalid to assistive tech', () => {
    const { getByRole } = render(
      <TestComponent
        name="annualRequestedSalary"
        label="Salary"
        savedSalaryOverCap
      />,
    );

    expect(getByRole('textbox', { name: 'Salary' })).toBeValid();
  });
});
