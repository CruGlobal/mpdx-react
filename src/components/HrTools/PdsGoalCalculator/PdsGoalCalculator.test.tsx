import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculator } from './PdsGoalCalculator';
import { PdsGoalCalculatorTestWrapper } from './PdsGoalCalculatorTestWrapper';

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
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          id: 'goal-1',
          name: 'Test Goal',
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: 50000,
          hoursWorkedPerWeek: null,
          benefits: 1500,
          geographicLocation: null,
        }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).not.toBeDisabled());
  });

  it('disables the Continue button when a required Setup field is empty', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          id: 'goal-1',
          name: 'Test Goal',
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: null,
          hoursWorkedPerWeek: null,
          benefits: 1500,
          geographicLocation: null,
        }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeDisabled());
  });

  it('re-enables the Continue button after the user fills in the missing field', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          id: 'goal-1',
          name: '',
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: 50000,
          hoursWorkedPerWeek: null,
          benefits: 1500,
          geographicLocation: null,
        }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const goalNameInput = await findByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(goalNameInput).not.toBeDisabled());

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeDisabled());

    userEvent.type(goalNameInput, 'My Goal');

    await waitFor(() => expect(continueButton).not.toBeDisabled());
  });
});
