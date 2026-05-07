import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { SetupStep } from './SetupStep';

const RightPanelProbe: React.FC = () => {
  const { rightPanelContent } = usePdsGoalCalculator();
  return <div data-testid="right-panel-probe">{rightPanelContent}</div>;
};

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

const partTimeHourlyMock = {
  ...fullTimeHourlyMock,
  status: DesignationSupportStatus.PartTime,
  benefits: null,
};

describe('SetupStep', () => {
  it('disables fields while calculation data is loading', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={undefined}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    // When calculation is undefined (loading), autosave fields should be disabled
    const goalName = await findByRole('textbox', { name: 'Goal Name' });
    expect(goalName).toBeDisabled();
  });

  it('shows validation errors for multiple empty required fields simultaneously', async () => {
    const { findByRole, findByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeHourlyMock,
          name: 'Test Goal',
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    const goalNameInput = await findByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(goalNameInput).toHaveValue('Test Goal'));

    userEvent.clear(goalNameInput);

    const payRateInput = await findByRole('spinbutton', { name: 'Pay Rate' });
    userEvent.clear(payRateInput);

    const hoursInput = await findByRole('spinbutton', {
      name: 'Hours Worked',
    });
    userEvent.clear(hoursInput);

    expect(
      await findByText('Goal Name is a required field'),
    ).toBeInTheDocument();
    expect(
      await findByText('Pay Rate is a required field'),
    ).toBeInTheDocument();
    expect(
      await findByText('Hours Worked is a required field'),
    ).toBeInTheDocument();
  });

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

  it('renders the calculator icon button next to Hours Worked', async () => {
    const { findByLabelText } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeHourlyMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByLabelText('Open hours per week calculator'),
    ).toBeInTheDocument();
  });

  it('opens the hours per week calculator in the right panel when the icon is clicked', async () => {
    const { findByLabelText, findByText, queryByText } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeHourlyMock}>
        <SetupStep />
        <RightPanelProbe />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(queryByText('Hours Per Week Calculator')).not.toBeInTheDocument();

    userEvent.click(await findByLabelText('Open hours per week calculator'));

    expect(await findByText('Hours Per Week Calculator')).toBeInTheDocument();
  });

  it('hides Hours Worked and adapts validation when switching from Hourly to Salaried', async () => {
    const { findByRole, queryByRole, rerender } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...fullTimeHourlyMock, hoursWorkedPerWeek: null }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Hours Worked is visible and required when Hourly
    const hoursInput = await findByRole('spinbutton', {
      name: 'Hours Worked',
    });
    expect(hoursInput).toBeInTheDocument();

    // Switch to Salaried — Hours Worked should disappear
    rerender(
      <PdsGoalCalculatorTestWrapper calculationMock={fullTimeSalariedMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Hours Worked' }),
      ).not.toBeInTheDocument();
    });

    // Benefits should still be visible (Full-time)
    expect(
      await findByRole('spinbutton', { name: 'Benefits' }),
    ).toBeInTheDocument();
  });

  it('hides Benefits and adapts validation when switching from Full-time to Part-time', async () => {
    const { findByRole, queryByRole, rerender } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...fullTimeHourlyMock, benefits: null }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Benefits is visible and required when Full-time
    const benefitsInput = await findByRole('spinbutton', {
      name: 'Benefits',
    });
    expect(benefitsInput).toBeInTheDocument();

    // Switch to Part-time Hourly — Benefits should disappear
    rerender(
      <PdsGoalCalculatorTestWrapper calculationMock={partTimeHourlyMock}>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Benefits' }),
      ).not.toBeInTheDocument();
    });

    // Hours Worked should still be visible (Hourly)
    expect(
      await findByRole('spinbutton', { name: 'Hours Worked' }),
    ).toBeInTheDocument();
  });

  it('renders the Form Type select with both options', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeSalariedMock,
          formType: DesignationSupportFormType.Detailed,
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    const select = await findByRole('combobox', { name: /Form Type/ });
    await waitFor(() => expect(select).toHaveTextContent('Default'));
    userEvent.click(select);

    expect(getByRole('option', { name: 'Default' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Simple' })).toBeInTheDocument();
  });

  it('shows 403b Contribution Percentage field when formType is Detailed', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeSalariedMock,
          formType: DesignationSupportFormType.Detailed,
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeInTheDocument();
  });

  it('hides 403b Contribution Percentage field when formType is Simple', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeSalariedMock,
          formType: DesignationSupportFormType.Simple,
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Wait for the Form Type select to reflect the loaded Simple value
    const formTypeSelect = await findByRole('combobox', { name: /Form Type/ });
    await waitFor(() => expect(formTypeSelect).toHaveTextContent('Simple'));

    expect(
      queryByRole('textbox', { name: '403b Contribution Percentage' }),
    ).not.toBeInTheDocument();
  });

  it('fires UpdatePdsGoalCalculation with formType when toggled to Simple', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeSalariedMock,
          formType: DesignationSupportFormType.Detailed,
        }}
        onCall={mutationSpy}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    const select = await findByRole('combobox', { name: /Form Type/ });
    await waitFor(() => expect(select).toHaveTextContent('Default'));
    userEvent.click(select);
    userEvent.click(getByRole('option', { name: 'Simple' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          formType: 'SIMPLE',
        },
      }),
    );
  });

  it('shows the 403b Contribution Percentage field when formType is null (legacy goal)', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...fullTimeSalariedMock,
          formType: null,
        }}
      >
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeInTheDocument();
  });
});
