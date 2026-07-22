import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form, Formik } from 'formik';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import * as yup from 'yup';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { defaultGoalCalculation } from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsPreviewProvider } from './GoalSettingsPreviewContext';
import { MpdGoalPreview } from './MpdGoalPreview';
import { PreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { calculationToFormValues } from './goalSettingsApiMapping';
import { PREVIEW_DEBOUNCE_MS } from './useMpdGoalPreview';

/**
 * A schema that rejects a negative salary, so a field can be edited into an
 * invalid state to exercise the `dirty && isValid` preview gate.
 */
const invalidatingSchema = yup.object({
  annualRequestedSalary: yup.number().min(0),
});

const accountListId = 'account-list-1';
const calculationId = 'goal-calculation-1';
const onCall = jest.fn();

const previewGoalMock = (
  monthlyGoal: number,
): {
  PreviewNewStaffGoalCalculation: PreviewNewStaffGoalCalculationMutation;
} => ({
  PreviewNewStaffGoalCalculation: {
    previewNewStaffGoalCalculation: {
      newStaffGoalCalculation: {
        id: calculationId,
        calculations: { monthlyGoal, salaryOverCap: false, debtOverCap: false },
      },
    },
  },
});

interface TestComponentProps {
  accountListId?: string | null;
  savedMonthlyGoal?: number;
  mocks?: ApolloErgonoMockMap;
  validationSchema?: yup.AnyObjectSchema;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId: accountListIdProp = accountListId,
  savedMonthlyGoal = 5000,
  mocks,
  validationSchema,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        PreviewNewStaffGoalCalculation: PreviewNewStaffGoalCalculationMutation;
      }>
        mocks={mocks}
        onCall={onCall}
      >
        <Formik
          initialValues={calculationToFormValues(defaultGoalCalculation)}
          validationSchema={validationSchema}
          onSubmit={jest.fn()}
        >
          <GoalSettingsPreviewProvider
            accountListId={accountListIdProp}
            calculationId={calculationId}
            savedSalaryOverCap={false}
            savedDebtOverCap={false}
          >
            <Form>
              {/* Two fields so the coalescing test can edit across both. */}
              <Field
                name="annualRequestedSalary"
                type="number"
                aria-label="Salary"
              />
              <Field name="tenure" type="number" aria-label="Tenure" />
              <MpdGoalPreview savedMonthlyGoal={savedMonthlyGoal} />
            </Form>
          </GoalSettingsPreviewProvider>
        </Formik>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

/** Edit a field; the preview keys off the value change, no blur needed. */
const editField = (field: HTMLElement, value: string) => {
  userEvent.clear(field);
  userEvent.type(field, value);
};

describe('MpdGoalPreview', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the saved goal total when there are no unsaved changes', async () => {
    const { findByText, queryByText } = render(<TestComponent />);

    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    // No signed difference is shown while the form is untouched.
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
    expect(onCall).not.toHaveGraphqlOperation('PreviewNewStaffGoalCalculation');
  });

  it('coalesces rapid edits across fields into a single preview request', async () => {
    const { getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    // Edit two fields within the debounce window.
    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');
    editField(getByRole('spinbutton', { name: 'Tenure' }), '5');

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation'),
    );
    const previewCalls = onCall.mock.calls.filter(
      ([{ operation }]) =>
        operation.operationName === 'PreviewNewStaffGoalCalculation',
    );
    expect(previewCalls).toHaveLength(1);
  });

  it('previews the new goal total and a positive difference when an edit raises the goal', async () => {
    const { findByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();
    expect(await findByText('+$200.00')).toBeInTheDocument();
  });

  it('shows a negative difference when an edit lowers the goal', async () => {
    const { findByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(4925)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '40000');

    expect(await findByText('MPD Goal: $4,925.00')).toBeInTheDocument();
    expect(await findByText('-$75.00')).toBeInTheDocument();
  });

  it('hides the goal total and difference while recalculating after another edit', async () => {
    const { findByText, getByRole, getByText, getByLabelText, queryByText } =
      render(<TestComponent mocks={previewGoalMock(5200)} />);

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');
    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();

    // A further edit starts a new preview. Until it returns, the "MPD Goal:"
    // label stays but the amount is replaced by a spinner and the difference is
    // hidden — no stale number on screen.
    editField(getByRole('spinbutton', { name: 'Salary' }), '70000');

    expect(getByLabelText('Calculating new goal total')).toBeInTheDocument();
    expect(getByText('MPD Goal:')).toBeInTheDocument();
    expect(queryByText(/MPD Goal: \$/)).not.toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('settles again after a further edit while recalculating', async () => {
    const { findByText, getByRole, getByLabelText } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');
    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();

    // A second edit supersedes the first; only its result (matched by key)
    // should replace the spinner once it settles.
    editField(getByRole('spinbutton', { name: 'Salary' }), '70000');
    expect(getByLabelText('Calculating new goal total')).toBeInTheDocument();

    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();
  });

  it('drops the preview and reverts to the saved goal when edits are undone', async () => {
    const { findByText, queryByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} savedMonthlyGoal={5000} />,
    );

    const salary = getByRole('spinbutton', {
      name: 'Salary',
    }) as HTMLInputElement;
    const original = salary.value;

    editField(salary, '80000');
    expect(await findByText('+$200.00')).toBeInTheDocument();

    // Undo the edit → the form is pristine again → the preview is dropped and
    // the header returns to the saved goal with no stale difference.
    editField(salary, original);

    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('previews a raise from a zero saved goal', async () => {
    const { findByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(200)} savedMonthlyGoal={0} />,
    );

    // Zero renders as a real total, not a blank.
    expect(await findByText('MPD Goal: $0.00')).toBeInTheDocument();

    // An edit raises the goal off zero; the diff is measured against $0.00.
    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    expect(await findByText('MPD Goal: $200.00')).toBeInTheDocument();
    expect(await findByText('+$200.00')).toBeInTheDocument();
  });

  it('shows no difference when the change does not affect the goal', async () => {
    const { findByText, queryByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5000)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    // Wait for the preview to run, then confirm the goal is unchanged and no
    // signed difference is rendered.
    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation'),
    );
    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('requests a preview with the edited attributes', async () => {
    const { getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '99999');

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation', {
        input: {
          accountListId,
          id: calculationId,
          attributes: { annualRequestedSalary: 99999 },
        },
      }),
    );
  });

  it('previews a scenario goal, omitting the account list', async () => {
    const { findByText, getByRole } = render(
      <TestComponent accountListId={null} mocks={previewGoalMock(5200)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    // A scenario goal has no account list; the API previews it all the same,
    // with the account list left out of the request.
    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation', {
        input: {
          id: calculationId,
          attributes: { annualRequestedSalary: 80000 },
        },
      }),
    );
    const previewCall = onCall.mock.calls.find(
      ([{ operation }]) =>
        operation.operationName === 'PreviewNewStaffGoalCalculation',
    );
    expect(
      previewCall?.[0].operation.variables.input.accountListId,
    ).toBeUndefined();
    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();
  });

  it('shows a spinner while the preview is loading', async () => {
    const { findByLabelText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    expect(
      await findByLabelText('Calculating new goal total'),
    ).toBeInTheDocument();
  });

  it('falls back to the saved goal when the preview request fails', async () => {
    const { findByText, queryByText, getByRole } = render(
      <TestComponent
        mocks={
          {
            PreviewNewStaffGoalCalculation: {
              previewNewStaffGoalCalculation: () => {
                throw new Error('Preview failed');
              },
            },
          } as ApolloErgonoMockMap
        }
      />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation'),
    );
    // The failure is surfaced (rather than looking like a zero-impact edit) and
    // the header falls back to the saved goal with no stale difference.
    expect(await findByText('Preview unavailable')).toBeInTheDocument();
    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('does not preview while the form is dirty but invalid', async () => {
    const { getByRole } = render(
      <TestComponent
        validationSchema={invalidatingSchema}
        mocks={previewGoalMock(5200)}
      />,
    );

    // A negative salary is a real edit but fails validation, so no preview
    // request should be sent with the invalid attributes.
    editField(getByRole('spinbutton', { name: 'Salary' }), '-100');
    jest.advanceTimersByTime(PREVIEW_DEBOUNCE_MS);

    expect(onCall).not.toHaveGraphqlOperation('PreviewNewStaffGoalCalculation');
  });

  it('drops the preview when a previewed edit is then made invalid', async () => {
    const { findByText, queryByText, getByRole } = render(
      <TestComponent
        validationSchema={invalidatingSchema}
        mocks={previewGoalMock(5200)}
        savedMonthlyGoal={5000}
      />,
    );

    editField(getByRole('spinbutton', { name: 'Salary' }), '80000');
    expect(await findByText('+$200.00')).toBeInTheDocument();

    // Making the edit invalid clears the preview: the header reverts to the
    // saved goal with no stale difference.
    editField(getByRole('spinbutton', { name: 'Salary' }), '-100');

    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });
});
