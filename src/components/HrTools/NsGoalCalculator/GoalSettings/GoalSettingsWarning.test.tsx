import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form, Formik } from 'formik';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { defaultGoalCalculation } from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsPreviewProvider } from './GoalSettingsPreviewContext';
import { GoalSettingsWarning } from './GoalSettingsWarning';
import { PreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { calculationToFormValues } from './goalSettingsApiMapping';
import { GoalSettingsFormValues } from './goalSettingsFormValues';
import { getGoalSettingsSchema } from './goalSettingsSchema';
import { NewStaffGoalCalculation } from './useNewStaffGoalCalculation';

const mutationSpy = jest.fn();

const { Married, Single } = NewStaffQuestionnaireMaritalStatusEnum;
const { Base, Select } = MpdGoalBenefitsConstantPlanEnum;
const { No, UpToBcc } = NewStaffGoalCalculationSalaryOverCapEnum;

interface TestComponentProps {
  savedSalaryOverCap?: boolean;
  savedDebtOverCap?: boolean;
  previewSalaryOverCap?: boolean;
  previewDebtOverCap?: boolean;
  allowSalaryOverCap?: GoalSettingsFormValues['allowSalaryOverCap'];
  allowDebtOverCap?: GoalSettingsFormValues['allowDebtOverCap'];
  maritalStatus?: GoalSettingsFormValues['maritalStatus'];
  healthcareExempt?: GoalSettingsFormValues['healthcareExempt'];
  spouseHealthcareExempt?: GoalSettingsFormValues['spouseHealthcareExempt'];
  secaExempt?: GoalSettingsFormValues['secaExempt'];
  spouseSecaExempt?: GoalSettingsFormValues['spouseSecaExempt'];
  benefitsPlan?: GoalSettingsFormValues['benefitsPlan'];
  validationSchema?: ReturnType<typeof getGoalSettingsSchema>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  savedSalaryOverCap = false,
  savedDebtOverCap = false,
  previewSalaryOverCap = false,
  previewDebtOverCap = false,
  allowSalaryOverCap = No,
  allowDebtOverCap = 'false',
  maritalStatus = Single,
  healthcareExempt = 'false',
  spouseHealthcareExempt = 'false',
  secaExempt = 'false',
  spouseSecaExempt = 'false',
  benefitsPlan = Base,
  validationSchema,
}) => {
  const calculation: NewStaffGoalCalculation = {
    ...defaultGoalCalculation,
    calculations: {
      ...defaultGoalCalculation.calculations,
      salaryOverCap: savedSalaryOverCap,
      debtOverCap: savedDebtOverCap,
    },
  };

  return (
    <GqlMockedProvider<{
      PreviewNewStaffGoalCalculation: PreviewNewStaffGoalCalculationMutation;
    }>
      mocks={{
        PreviewNewStaffGoalCalculation: {
          previewNewStaffGoalCalculation: {
            newStaffGoalCalculation: {
              id: defaultGoalCalculation.id,
              calculations: {
                monthlyGoal: 5200,
                salaryOverCap: previewSalaryOverCap,
                debtOverCap: previewDebtOverCap,
              },
            },
          },
        },
      }}
      onCall={mutationSpy}
    >
      <Formik
        initialValues={{
          ...calculationToFormValues(defaultGoalCalculation),
          allowSalaryOverCap,
          allowDebtOverCap,
          maritalStatus,
          healthcareExempt,
          spouseHealthcareExempt,
          secaExempt,
          spouseSecaExempt,
          benefitsPlan,
        }}
        validationSchema={validationSchema}
        onSubmit={jest.fn()}
      >
        {({ isValid }) => (
          <GoalSettingsPreviewProvider
            accountListId="account-list-1"
            calculation={calculation}
          >
            <Form>
              <Field
                name="annualRequestedSalary"
                type="number"
                aria-label="Salary"
              />
              <span data-testid="is-valid">{String(isValid)}</span>
              <GoalSettingsWarning />
            </Form>
          </GoalSettingsPreviewProvider>
        )}
      </Formik>
    </GqlMockedProvider>
  );
};

describe('GoalSettingsWarning', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('warns when the saved calculation is over the salary cap', () => {
    const { getByText } = render(<TestComponent savedSalaryOverCap />);

    expect(
      getByText('Total salary is over the standard cap'),
    ).toBeInTheDocument();
  });

  it('clears a salary warning an edit resolves, and keeps it clear while a later edit previews', async () => {
    const { getByRole, getByText, queryByText } = render(
      <TestComponent savedSalaryOverCap />,
    );

    expect(
      getByText('Total salary is over the standard cap'),
    ).toBeInTheDocument();

    const salary = getByRole('spinbutton', { name: 'Salary' });
    userEvent.clear(salary);
    userEvent.type(salary, '40000');

    await waitFor(() =>
      expect(
        queryByText('Total salary is over the standard cap'),
      ).not.toBeInTheDocument(),
    );

    userEvent.clear(salary);
    userEvent.type(salary, '41000');

    expect(
      queryByText('Total salary is over the standard cap'),
    ).not.toBeInTheDocument();
  });

  it('raises a salary warning an edit introduces, and does not resurrect it once undone', async () => {
    const { findByText, getByRole, queryByText } = render(
      <TestComponent previewSalaryOverCap />,
    );

    expect(
      queryByText('Total salary is over the standard cap'),
    ).not.toBeInTheDocument();

    const salary = getByRole('spinbutton', {
      name: 'Salary',
    }) as HTMLInputElement;
    const original = salary.value;

    userEvent.clear(salary);
    userEvent.type(salary, '250000');

    expect(
      await findByText('Total salary is over the standard cap'),
    ).toBeInTheDocument();

    userEvent.clear(salary);
    userEvent.type(salary, original);

    await waitFor(() =>
      expect(
        queryByText('Total salary is over the standard cap'),
      ).not.toBeInTheDocument(),
    );

    userEvent.clear(salary);
    userEvent.type(salary, '41000');

    expect(
      queryByText('Total salary is over the standard cap'),
    ).not.toBeInTheDocument();
  });

  it('keeps a resolved salary warning hidden while the form is invalid', async () => {
    const { getByRole, getByTestId, getByText, queryByText } = render(
      <TestComponent
        savedSalaryOverCap
        validationSchema={getGoalSettingsSchema(i18n.t)}
      />,
    );

    expect(
      getByText('Total salary is over the standard cap'),
    ).toBeInTheDocument();

    const salary = getByRole('spinbutton', { name: 'Salary' });
    userEvent.clear(salary);
    userEvent.type(salary, '40000');

    await waitFor(() =>
      expect(
        queryByText('Total salary is over the standard cap'),
      ).not.toBeInTheDocument(),
    );

    userEvent.clear(salary);
    userEvent.type(salary, '-100');

    await waitFor(() =>
      expect(getByTestId('is-valid')).toHaveTextContent('false'),
    );

    expect(
      queryByText('Total salary is over the standard cap'),
    ).not.toBeInTheDocument();
  });

  it('shows the salary warning in the error color when no exception allows it', () => {
    const { getByText } = render(
      <TestComponent savedSalaryOverCap allowSalaryOverCap={No} />,
    );

    expect(
      getByText('Total salary is over the standard cap').closest(
        '.MuiAlert-root',
      ),
    ).toHaveClass('MuiAlert-standardError');
  });

  it('treats an unset salary exception as not allowed', () => {
    const { getByText } = render(
      <TestComponent savedSalaryOverCap allowSalaryOverCap="" />,
    );

    expect(
      getByText('Total salary is over the standard cap').closest(
        '.MuiAlert-root',
      ),
    ).toHaveClass('MuiAlert-standardError');
  });

  it('warns when the saved calculation is over the debt cap', () => {
    const { getByText } = render(<TestComponent savedDebtOverCap />);

    expect(
      getByText('Annual debt is over the standard cap'),
    ).toBeInTheDocument();
  });

  // The preview lifecycle is shared machinery, covered by the salary tests
  // above; this only checks the debt flag is wired to it.
  it('raises a debt warning an edit introduces', async () => {
    const { findByText, getByRole, queryByText } = render(
      <TestComponent previewDebtOverCap />,
    );

    expect(
      queryByText('Annual debt is over the standard cap'),
    ).not.toBeInTheDocument();

    const salary = getByRole('spinbutton', { name: 'Salary' });
    userEvent.clear(salary);
    userEvent.type(salary, '250000');

    expect(
      await findByText('Annual debt is over the standard cap'),
    ).toBeInTheDocument();
  });

  it('shows the debt warning in the warning color when an exception allows it', () => {
    const { getByText } = render(
      <TestComponent savedDebtOverCap allowDebtOverCap="true" />,
    );

    expect(
      getByText('Annual debt is over the standard cap').closest(
        '.MuiAlert-root',
      ),
    ).toHaveClass('MuiAlert-standardWarning');
  });

  it('warns about only the cap that is exceeded', () => {
    const { getByText, queryByText } = render(
      <TestComponent savedDebtOverCap />,
    );

    expect(
      getByText('Annual debt is over the standard cap'),
    ).toBeInTheDocument();
    expect(
      queryByText('Total salary is over the standard cap'),
    ).not.toBeInTheDocument();
  });

  it('colors each warning by its own exception', () => {
    const { getByText } = render(
      <TestComponent
        savedSalaryOverCap
        savedDebtOverCap
        allowSalaryOverCap={UpToBcc}
        allowDebtOverCap="false"
      />,
    );

    expect(
      getByText('Total salary is over the standard cap').closest(
        '.MuiAlert-root',
      ),
    ).toHaveClass('MuiAlert-standardWarning');
    expect(
      getByText('Annual debt is over the standard cap').closest(
        '.MuiAlert-root',
      ),
    ).toHaveClass('MuiAlert-standardError');
  });

  it('warns when staff opted out of SECA', () => {
    const { getByText } = render(
      <TestComponent maritalStatus={Married} secaExempt="true" />,
    );

    expect(getByText('Staff opted out of SECA')).toBeInTheDocument();
  });

  it('warns when the spouse opted out of SECA', () => {
    const { getByText } = render(
      <TestComponent maritalStatus={Married} spouseSecaExempt="true" />,
    );

    expect(getByText('Spouse opted out of SECA')).toBeInTheDocument();
  });

  it('warns when both opted out of SECA', () => {
    const { getByText } = render(
      <TestComponent
        maritalStatus={Married}
        secaExempt="true"
        spouseSecaExempt="true"
      />,
    );

    expect(getByText('Both opted out of SECA')).toBeInTheDocument();
  });

  it('warns when staff is healthcare exempt', () => {
    const { getByText } = render(
      <TestComponent maritalStatus={Married} healthcareExempt="true" />,
    );

    expect(getByText('Staff is healthcare exempt')).toBeInTheDocument();
  });

  it('warns when the spouse is healthcare exempt', () => {
    const { getByText } = render(
      <TestComponent maritalStatus={Married} spouseHealthcareExempt="true" />,
    );

    expect(getByText('Spouse is healthcare exempt')).toBeInTheDocument();
  });

  it('warns when both are healthcare exempt', () => {
    const { getByText } = render(
      <TestComponent
        maritalStatus={Married}
        healthcareExempt="true"
        spouseHealthcareExempt="true"
      />,
    );

    expect(getByText('Both are healthcare exempt')).toBeInTheDocument();
  });

  it('shows exemption warnings in the warning color, never as errors', () => {
    const { getByText } = render(
      <TestComponent
        maritalStatus={Married}
        secaExempt="true"
        healthcareExempt="true"
        benefitsPlan={Select}
      />,
    );

    expect(
      getByText('Staff opted out of SECA').closest('.MuiAlert-root'),
    ).toHaveClass('MuiAlert-standardWarning');
    expect(
      getByText('Staff is healthcare exempt').closest('.MuiAlert-root'),
    ).toHaveClass('MuiAlert-standardWarning');
  });

  it('ignores a stale spouse SECA exemption once the applicant is single', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        maritalStatus={Single}
        secaExempt="true"
        spouseSecaExempt="true"
      />,
    );

    expect(getByText('Staff opted out of SECA')).toBeInTheDocument();
    expect(queryByText('Both opted out of SECA')).not.toBeInTheDocument();
  });
  it('announces warnings politely, from a region that exists while empty', () => {
    const { container, rerender } = render(<TestComponent />);

    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();

    rerender(<TestComponent savedSalaryOverCap />);

    expect(region).toHaveTextContent('Total salary is over the standard cap');
  });
});
