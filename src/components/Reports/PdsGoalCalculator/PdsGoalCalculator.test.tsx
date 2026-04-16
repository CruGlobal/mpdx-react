import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculator } from './PdsGoalCalculator';
import { PdsGoalCalculatorTestWrapper } from './PdsGoalCalculatorTestWrapper';

const completeSetupMock = {
  id: 'goal-1',
  name: 'Test Goal',
  status: DesignationSupportStatus.FullTime,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 50000,
  hoursWorkedPerWeek: null,
  benefits: 1500,
  geographicLocation: 'Orlando, FL',
};

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

  it('disables Continue on Setup step when a required field is missing', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...completeSetupMock, name: '' }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeDisabled());
  });

  it('disables Continue on Setup step when geographicLocation is not set', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...completeSetupMock, geographicLocation: null }}
      >
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeDisabled());
  });

  it('enables Continue on Setup step when all required fields are filled', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={completeSetupMock}>
        <PdsGoalCalculator />
      </PdsGoalCalculatorTestWrapper>,
    );

    const continueButton = await findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeEnabled());
  });
});
