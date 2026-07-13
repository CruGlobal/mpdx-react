import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form, Formik } from 'formik';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { defaultGoalCalculation } from '../NsGoalCalculatorTestWrapper';
import { MpdGoalPreview } from './MpdGoalPreview';
import { PreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { calculationToFormValues } from './goalSettingsApiMapping';

const accountListId = 'account-list-1';
const calculationId = 'goal-calculation-1';

const previewGoalMock = (
  monthlyGoal: number,
): {
  PreviewNewStaffGoalCalculation: PreviewNewStaffGoalCalculationMutation;
} => ({
  PreviewNewStaffGoalCalculation: {
    previewNewStaffGoalCalculation: {
      newStaffGoalCalculation: {
        id: calculationId,
        calculations: { monthlyGoal },
      },
    },
  },
});

interface TestComponentProps {
  accountListId?: string | null;
  savedMonthlyGoal?: number;
  mocks?: ApolloErgonoMockMap;
  onCall?: jest.Mock;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId: accountListIdProp = accountListId,
  savedMonthlyGoal = 5000,
  mocks,
  onCall,
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
          onSubmit={jest.fn()}
        >
          <Form>
            {/* Two fields so tabbing off the first blurs it (focusout). */}
            <Field
              name="annualRequestedSalary"
              type="number"
              aria-label="Salary"
            />
            <Field name="tenure" type="number" aria-label="Tenure" />
            <MpdGoalPreview
              accountListId={accountListIdProp}
              calculationId={calculationId}
              savedMonthlyGoal={savedMonthlyGoal}
            />
          </Form>
        </Formik>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

/** Edit the salary field and blur it (tab away) to commit a preview. */
const editSalaryAndBlur = (field: HTMLElement, value: string) => {
  userEvent.clear(field);
  userEvent.type(field, value);
  userEvent.tab();
};

describe('MpdGoalPreview', () => {
  it('shows the saved goal total when there are no unsaved changes', async () => {
    const onCall = jest.fn();
    const { findByText, queryByText } = render(
      <TestComponent onCall={onCall} />,
    );

    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    // No signed difference is shown while the form is untouched.
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
    expect(onCall).not.toHaveGraphqlOperation('PreviewNewStaffGoalCalculation');
  });

  it('does not preview while typing, before the field is blurred', () => {
    jest.useFakeTimers();
    try {
      const onCall = jest.fn();
      const { getByRole } = render(
        <TestComponent mocks={previewGoalMock(5200)} onCall={onCall} />,
      );

      const salary = getByRole('spinbutton', { name: 'Salary' });
      userEvent.clear(salary);
      userEvent.type(salary, '80000');
      // No blur yet: even past the debounce window, typing triggers no preview.
      jest.advanceTimersByTime(1000);

      expect(onCall).not.toHaveGraphqlOperation(
        'PreviewNewStaffGoalCalculation',
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('previews the new goal total and a positive difference when an edit raises the goal', async () => {
    const { findByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} />,
    );

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');

    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();
    expect(await findByText('+$200.00')).toBeInTheDocument();
  });

  it('shows a negative difference when an edit lowers the goal', async () => {
    const { findByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(4925)} />,
    );

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '40000');

    expect(await findByText('MPD Goal: $4,925.00')).toBeInTheDocument();
    expect(await findByText('-$75.00')).toBeInTheDocument();
  });

  it('hides the goal total and difference while recalculating after another edit', async () => {
    const { findByText, getByRole, getByText, getByLabelText, queryByText } =
      render(<TestComponent mocks={previewGoalMock(5200)} />);

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');
    expect(await findByText('MPD Goal: $5,200.00')).toBeInTheDocument();

    // A further edit starts a new preview. Until it returns, the "MPD Goal:"
    // label stays but the amount is replaced by a spinner and the difference is
    // hidden — no stale number on screen.
    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '70000');

    expect(getByLabelText('Calculating new goal total')).toBeInTheDocument();
    expect(getByText('MPD Goal:')).toBeInTheDocument();
    expect(queryByText(/MPD Goal: \$/)).not.toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('shows no difference when the change does not affect the goal', async () => {
    const onCall = jest.fn();
    const { findByText, queryByText, getByRole } = render(
      <TestComponent mocks={previewGoalMock(5000)} onCall={onCall} />,
    );

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');

    // Wait for the preview to run, then confirm the goal is unchanged and no
    // signed difference is rendered.
    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation'),
    );
    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });

  it('requests a preview with the edited attributes', async () => {
    const onCall = jest.fn();
    const { getByRole } = render(
      <TestComponent mocks={previewGoalMock(5200)} onCall={onCall} />,
    );

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '99999');

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
    const onCall = jest.fn();
    const { findByText, getByRole } = render(
      <TestComponent
        accountListId={null}
        mocks={previewGoalMock(5200)}
        onCall={onCall}
      />,
    );

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');

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

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');

    expect(
      await findByLabelText('Calculating new goal total'),
    ).toBeInTheDocument();
  });

  it('falls back to the saved goal when the preview request fails', async () => {
    const onCall = jest.fn();
    const { findByText, queryByText, getByRole } = render(
      <TestComponent
        onCall={onCall}
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

    editSalaryAndBlur(getByRole('spinbutton', { name: 'Salary' }), '80000');

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('PreviewNewStaffGoalCalculation'),
    );
    expect(await findByText('MPD Goal: $5,000.00')).toBeInTheDocument();
    expect(queryByText(/[+-]\$/)).not.toBeInTheDocument();
  });
});
