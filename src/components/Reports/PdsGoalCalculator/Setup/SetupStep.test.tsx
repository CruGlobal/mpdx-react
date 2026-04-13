import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SetupStep } from './SetupStep';

const mutationSpy = jest.fn();

const fullTimeSalariedMock = {
  id: 'goal-1',
  status: DesignationSupportStatus.FullTime,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 50000,
  hoursWorkedPerWeek: null,
  benefits: 1500,
  geographicLocation: null,
};

const partTimeSalariedMock = {
  ...fullTimeSalariedMock,
  status: DesignationSupportStatus.PartTime,
};

const fullTimeHourlyMock = {
  ...fullTimeSalariedMock,
  salaryOrHourly: DesignationSupportSalaryType.Hourly,
  payRate: 25,
  hoursWorkedPerWeek: 40,
};

describe('SetupStep', () => {
  it('renders all visible fields for full-time salaried (Benefits shown, Hours Worked hidden)', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', { name: 'Goal Name' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('spinbutton', { name: 'Pay Rate' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('spinbutton', { name: 'Benefits' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('combobox', { name: 'Geographic Multiplier' }),
    ).toBeInTheDocument();

    // Hours Worked should be hidden for salaried
    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Hours Worked' }),
      ).not.toBeInTheDocument();
    });
  });

  it('hides Benefits when Part-time', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={partTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', { name: 'Goal Name' }),
    ).toBeInTheDocument();

    // Benefits should be hidden for part-time
    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Benefits' }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows Hours Worked when Hourly', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeHourlyMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('spinbutton', { name: 'Hours Worked' }),
    ).toBeInTheDocument();
  });

  it('shows dynamic Pay Rate helper text based on salary type', async () => {
    const { findByRole, findByText, rerender } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('spinbutton', { name: 'Pay Rate' });
    expect(await findByText('Enter yearly salary')).toBeInTheDocument();

    rerender(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeHourlyMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Enter hourly rate')).toBeInTheDocument();
  });

  it('403b field is disabled', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeDisabled();
  });

  it('displays the sum of tax-deferred and Roth 403b contribution percentages', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeSalariedMock}
        hcmUserMock={{
          fourOThreeB: {
            currentTaxDeferredContributionPercentage: 5,
            currentRothContributionPercentage: 3,
          },
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(async () =>
      expect(
        await findByRole('textbox', {
          name: '403b Contribution Percentage',
        }),
      ).toHaveValue('8'),
    );
  });

  it('403b field is empty when hcm data has no 403b entry', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeSalariedMock}
        hcmUserMock={null}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', {
        name: '403b Contribution Percentage',
      }),
    ).toHaveValue('');
  });

  it('displays the logged-in user first name and avatar', async () => {
    const { getByTestId, getByAltText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeSalariedMock}
        userMock={{
          user: {
            firstName: 'Jane',
            avatar: 'https://example.com/jane.png',
          },
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(getByTestId('info-name-typography')).toHaveTextContent('Jane'),
    );
    expect(getByAltText('Jane')).toHaveAttribute(
      'src',
      'https://example.com/jane.png',
    );
  });

  it('Geographic Multiplier autocomplete renders', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('combobox', { name: 'Geographic Multiplier' }),
    ).toBeInTheDocument();
  });

  it('fires mutation when Goal Name is changed', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...fullTimeSalariedMock, name: 'Test Goal' }}
        onCall={mutationSpy}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    const input = await findByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(input).toHaveValue('Test Goal'));

    userEvent.clear(input);
    userEvent.type(input, 'Updated Goal');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          name: 'Updated Goal',
        },
      }),
    );
  });

  it('fires mutation when Geographic Multiplier is selected', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeSalariedMock}
        onCall={mutationSpy}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    const input = await findByRole('combobox', {
      name: 'Geographic Multiplier',
    });
    await waitFor(() => expect(input).not.toBeDisabled());
    userEvent.type(input, 'Orlando');
    const option = await findByRole('option', { name: 'Orlando, FL' });
    userEvent.click(option);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          geographicLocation: 'Orlando, FL',
        },
      }),
    );
  });
});
