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
});
