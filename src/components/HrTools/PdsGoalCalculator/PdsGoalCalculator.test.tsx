import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculator } from './PdsGoalCalculator';
import { PdsGoalCalculatorTestWrapper } from './PdsGoalCalculatorTestWrapper';

// Math.round(overallTotal) for the default PdsGoalCalculatorTestWrapper mock
// (Salaried full-time, $50k pay rate, $1.5k benefits, default rate constants).
// Salary subtotal $4,500 + benefits $1,500 = $6,000; after attrition / CC fees
// / admin assessment this rounds to $7,689. See usePdsSummaryData.
const EXPECTED_MONTHLY_GOAL = 7689;

describe('PdsGoalCalculator', () => {
  it('renders the setup step by default', () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      getByRole('heading', { level: 6, name: 'Calculator Setup' }),
    ).toBeInTheDocument();
  });

  it('enables the Continue button when all required Setup fields are filled', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).not.toBeDisabled());
  });

  it('disables the Continue button when a required Setup field is empty', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ payRate: null }}>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('re-enables the Continue button after the user fills in the missing field', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ name: '' }}>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const goalNameInput = await findByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(goalNameInput).not.toBeDisabled());

    const continueButton = await findByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();

    userEvent.type(goalNameInput, 'My Goal');

    expect(continueButton).not.toBeDisabled();
  });

  it('re-enables Continue after switching from Hourly to Salaried and entering a new Pay Rate', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          salaryOrHourly: DesignationSupportSalaryType.Hourly,
          hoursWorkedPerWeek: null,
          status: DesignationSupportStatus.FullTime,
          payRate: 25,
          benefits: 1500,
          name: 'Test Goal',
        }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    expect(
      await findByRole('spinbutton', { name: 'Hours Worked' }),
    ).toBeInTheDocument();
    await waitFor(() => expect(continueButton).toBeDisabled());

    const payTypeSelect = getByRole('combobox', { name: 'Pay Type' });
    await waitFor(() =>
      expect(payTypeSelect).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(payTypeSelect);
    userEvent.click(await findByRole('option', { name: 'Salaried' }));

    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Hours Worked' }),
      ).not.toBeInTheDocument();
    });
    // Switching Pay Type clears payRate, so the user must re-enter it before
    // Continue becomes enabled.
    const payRateInput = await findByRole('spinbutton', { name: 'Pay Rate' });
    userEvent.type(payRateInput, '50000');

    await waitFor(() => expect(continueButton).not.toBeDisabled());
  });

  it('hides the Back button on the first step', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('button', { name: /continue/i });
    expect(queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('shows the Back button after advancing past the first step', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).not.toBeDisabled());
    userEvent.click(continueButton);

    expect(await findByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('clicking Back returns to the previous step', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).not.toBeDisabled());
    userEvent.click(continueButton);

    const backButton = await findByRole('button', { name: /back/i });
    userEvent.click(backButton);

    await waitFor(() =>
      expect(queryByRole('button', { name: /back/i })).not.toBeInTheDocument(),
    );
    expect(
      await findByRole('heading', { level: 6, name: 'Calculator Setup' }),
    ).toBeInTheDocument();
  });

  it('disables Finish & Apply Goal on the Summary Report step when summary data is unavailable', async () => {
    // Empty misc constants make `buildPdsGoalConstants` return null, so
    // `summaryData` stays null even though every form field is valid. Without
    // the guard on `disableNext`, the button would be enabled and clicking it
    // would submit monthlyGoal: 0 — overwriting any prior real goal.
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        constantsMock={{ mpdGoalMiscConstants: [] }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Summary Report' }));

    const finishButton = await findByRole('button', {
      name: /Finish & Apply Goal/i,
    });
    await waitFor(() => expect(finishButton).toBeDisabled());
  });

  it('re-enables Continue when switching from Full-time to Part-time hides the only invalid field', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          benefits: null,
          payRate: 50000,
          name: 'Test Goal',
        }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    expect(
      await findByRole('spinbutton', { name: 'Benefits' }),
    ).toBeInTheDocument();
    await waitFor(() => expect(continueButton).toBeDisabled());

    const statusSelect = getByRole('combobox', { name: 'Employment Status' });
    await waitFor(() =>
      expect(statusSelect).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(statusSelect);
    userEvent.click(await findByRole('option', { name: 'Part-time' }));

    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Benefits' }),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => expect(continueButton).not.toBeDisabled());
  });

  describe('submit goal flow', () => {
    // Use Simple formType so the Detailed-only ReimbursableExpenses step is
    // skipped (Setup → SupportItem → SummaryReport), keeping the test focused
    // on the last-step submit rather than mid-flow navigation.
    const simpleFormMock = {
      formType: DesignationSupportFormType.Simple,
    };

    const advanceToLastStep = async (
      findByRole: ReturnType<typeof render>['findByRole'],
    ) => {
      // Step 1 → 2: Continue is initially disabled while autosave fields
      // register their validity; the default mock data is fully valid.
      let next = await findByRole('button', { name: /continue/i });
      await waitFor(() => expect(next).not.toBeDisabled());
      userEvent.click(next);

      // Step 2 → 3: SupportItem has no autosave-tracked fields, so allValid
      // stays true and Continue is enabled immediately.
      next = await findByRole('button', { name: /continue/i });
      await waitFor(() => expect(next).not.toBeDisabled());
      userEvent.click(next);
    };

    it('renders "Finish & Apply Goal" instead of "Continue" on the last step', async () => {
      const { findByRole, queryByRole } = render(
        <PdsGoalCalculatorTestWrapper calculationMock={simpleFormMock}>
          <PdsGoalCalculator />
        </PdsGoalCalculatorTestWrapper>,
      );

      await advanceToLastStep(findByRole);

      expect(
        await findByRole('button', { name: 'Finish & Apply Goal' }),
      ).toBeInTheDocument();
      expect(
        queryByRole('button', { name: /^continue$/i }),
      ).not.toBeInTheDocument();
    });

    it('submits the rounded monthlyGoal for the current accountListId', async () => {
      const mutationSpy = jest.fn();
      const { findByRole } = render(
        <PdsGoalCalculatorTestWrapper
          calculationMock={simpleFormMock}
          onCall={mutationSpy}
        >
          <PdsGoalCalculator />
        </PdsGoalCalculatorTestWrapper>,
      );

      await advanceToLastStep(findByRole);

      const finishButton = await findByRole('button', {
        name: 'Finish & Apply Goal',
      });
      userEvent.click(finishButton);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
          input: {
            id: 'abc123',
            attributes: {
              id: 'abc123',
              settings: { monthlyGoal: EXPECTED_MONTHLY_GOAL },
            },
          },
        }),
      );
    });

    it('shows a success snackbar with the formatted monthly goal on completion', async () => {
      const { findByRole, findByText } = render(
        <PdsGoalCalculatorTestWrapper calculationMock={simpleFormMock}>
          <PdsGoalCalculator />
        </PdsGoalCalculatorTestWrapper>,
      );

      await advanceToLastStep(findByRole);

      userEvent.click(
        await findByRole('button', { name: 'Finish & Apply Goal' }),
      );

      expect(
        await findByText(
          `Successfully updated your monthly goal to $${EXPECTED_MONTHLY_GOAL.toLocaleString(
            'en-US',
          )}!`,
        ),
      ).toBeInTheDocument();
    });

    it('shows a "Saving..." label and disables the button while the mutation is in flight', async () => {
      const { findByRole, getByRole } = render(
        <PdsGoalCalculatorTestWrapper calculationMock={simpleFormMock}>
          <PdsGoalCalculator />
        </PdsGoalCalculatorTestWrapper>,
      );

      await advanceToLastStep(findByRole);

      const finishButton = await findByRole('button', {
        name: 'Finish & Apply Goal',
      });
      userEvent.click(finishButton);

      // Synchronously after click, the mutation is pending — the button label
      // becomes "Saving..." with an in-button spinner and stays disabled to
      // prevent a double-submit.
      const savingButton = getByRole('button', { name: 'Saving...' });
      expect(savingButton).toBeDisabled();
      expect(
        savingButton.querySelector('.MuiCircularProgress-root'),
      ).toBeInTheDocument();
    });

    it('keeps the Finish & Apply Goal button disabled after a successful submission', async () => {
      const { findByRole, findByText } = render(
        <PdsGoalCalculatorTestWrapper calculationMock={simpleFormMock}>
          <PdsGoalCalculator />
        </PdsGoalCalculatorTestWrapper>,
      );

      await advanceToLastStep(findByRole);

      const finishButton = await findByRole('button', {
        name: 'Finish & Apply Goal',
      });
      userEvent.click(finishButton);

      // Wait for the success snackbar so we know the mutation has settled,
      // then verify the button stays disabled — otherwise a blur+click or
      // double-click after success would fire a second mutation.
      await findByText(/Successfully updated your monthly goal/);
      expect(finishButton).toBeDisabled();
    });
  });
});
