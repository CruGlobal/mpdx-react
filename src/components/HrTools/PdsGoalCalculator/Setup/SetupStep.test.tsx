import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  PdsGoalCalculatorTestWrapper,
  PdsGoalCalculatorTestWrapperProps,
} from '../PdsGoalCalculatorTestWrapper';
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

const setupTree = (
  props: Partial<PdsGoalCalculatorTestWrapperProps> = {},
  extraChildren?: React.ReactNode,
) => (
  <PdsGoalCalculatorTestWrapper {...props}>
    <SetupStep />
    {extraChildren}
  </PdsGoalCalculatorTestWrapper>
);

const renderSetup = (
  props?: Partial<PdsGoalCalculatorTestWrapperProps>,
  extraChildren?: React.ReactNode,
) => render(setupTree(props, extraChildren));

describe('SetupStep', () => {
  it('disables fields while calculation data is loading', async () => {
    const { findByRole } = renderSetup({ calculationMock: undefined });

    // When calculation is undefined (loading), autosave fields should be disabled
    const goalName = await findByRole('textbox', { name: 'Goal Name' });
    expect(goalName).toBeDisabled();
  });

  it('shows validation errors for multiple empty required fields simultaneously', async () => {
    const { findByRole, findByText } = renderSetup({
      calculationMock: {
        ...fullTimeHourlyMock,
        name: 'Test Goal',
      },
    });

    const goalNameInput = await findByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(goalNameInput).toHaveValue('Test Goal'));

    userEvent.clear(goalNameInput);
    userEvent.tab();

    const payRateInput = await findByRole('spinbutton', {
      name: 'Hourly Pay Rate',
    });
    userEvent.clear(payRateInput);
    userEvent.tab();

    const hoursInput = await findByRole('spinbutton', {
      name: 'Hours Worked',
    });
    userEvent.clear(hoursInput);
    userEvent.tab();

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

  it('shows Benefits and hides Hours Worked for full-time salaried', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
    });

    await findByRole('textbox', { name: 'Goal Name' });

    expect(
      await findByRole('spinbutton', { name: 'Benefits' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        queryByRole('spinbutton', { name: 'Hours Worked' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('hides Benefits and Hours Worked for part-time salaried', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: partTimeSalariedMock,
    });

    await findByRole('textbox', { name: 'Goal Name' });

    await waitFor(() => {
      expect(
        queryByRole('spinbutton', { name: 'Benefits' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('spinbutton', { name: 'Hours Worked' }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows Benefits and Hours Worked for full-time hourly', async () => {
    const { findByRole } = renderSetup({
      calculationMock: fullTimeHourlyMock,
    });

    await findByRole('textbox', { name: 'Goal Name' });

    expect(
      await findByRole('spinbutton', { name: 'Benefits' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('spinbutton', { name: 'Hours Worked' }),
    ).toBeInTheDocument();
  });

  it('hides Benefits and shows Hours Worked for part-time hourly', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: partTimeHourlyMock,
    });

    await findByRole('textbox', { name: 'Goal Name' });

    expect(
      await findByRole('spinbutton', { name: 'Hours Worked' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        queryByRole('spinbutton', { name: 'Benefits' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('hides Pay Rate when pay type is not set', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        salaryOrHourly: null,
        payRate: null,
      },
    });

    await findByRole('textbox', { name: 'Goal Name' });

    expect(
      queryByRole('spinbutton', { name: /Pay Rate/ }),
    ).not.toBeInTheDocument();
  });

  it('shows dynamic Pay Rate label and helper text based on salary type', async () => {
    const { findByRole, findByText, rerender } = renderSetup({
      calculationMock: fullTimeSalariedMock,
    });

    await findByRole('spinbutton', { name: 'Annual Pay Rate' });
    expect(await findByText('Enter yearly salary')).toBeInTheDocument();
    expect(await findByText('per year')).toBeInTheDocument();

    rerender(setupTree({ calculationMock: fullTimeHourlyMock }));

    await findByRole('spinbutton', { name: 'Hourly Pay Rate' });
    expect(await findByText('Enter hourly rate')).toBeInTheDocument();
    expect(await findByText('per hour')).toBeInTheDocument();
  });

  it('403b field is disabled', async () => {
    const { findByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
    });

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeDisabled();
  });

  it('displays the sum of tax-deferred and Roth 403b contribution percentages', async () => {
    const { findByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      hcmUserMock: {
        fourOThreeB: {
          currentTaxDeferredContributionPercentage: 5,
          currentRothContributionPercentage: 3,
        },
      },
    });

    await waitFor(async () =>
      expect(
        await findByRole('textbox', {
          name: '403b Contribution Percentage',
        }),
      ).toHaveValue('8'),
    );
  });

  it('403b field is empty when hcm data has no 403b entry', async () => {
    const { findByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      hcmUserMock: null,
    });

    expect(
      await findByRole('textbox', {
        name: '403b Contribution Percentage',
      }),
    ).toHaveValue('');
  });

  it('displays the logged-in user first name and avatar', async () => {
    const { getByTestId, getByAltText } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      userMock: {
        user: {
          firstName: 'Jane',
          avatar: 'https://example.com/jane.png',
        },
      },
    });

    await waitFor(() =>
      expect(getByTestId('info-name-typography')).toHaveTextContent('Jane'),
    );
    expect(getByAltText('Jane')).toHaveAttribute(
      'src',
      'https://example.com/jane.png',
    );
  });

  it('Geographic Multiplier autocomplete renders', async () => {
    const { findByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
    });

    expect(
      await findByRole('combobox', { name: 'Geographic Multiplier' }),
    ).toBeInTheDocument();
  });

  it('renders Geographic Multiplier option without percentage when multiplier is 0', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
    });

    const input = await findByRole('combobox', {
      name: 'Geographic Multiplier',
    });
    await waitFor(() => expect(input).not.toBeDisabled());
    userEvent.click(input);

    expect(await findByRole('option', { name: 'None' })).toBeInTheDocument();
    expect(
      queryByRole('option', { name: /None \(.*%\)/ }),
    ).not.toBeInTheDocument();
  });

  it('fires mutation when Goal Name is changed', async () => {
    const { findByRole } = renderSetup({
      calculationMock: { ...fullTimeSalariedMock, name: 'Test Goal' },
      onCall: mutationSpy,
    });

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
    const { findByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      onCall: mutationSpy,
    });

    const input = await findByRole('combobox', {
      name: 'Geographic Multiplier',
    });
    await waitFor(() => expect(input).not.toBeDisabled());
    userEvent.type(input, 'Orlando');
    const option = await findByRole('option', { name: 'Orlando, FL (6%)' });
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
    const { findByLabelText } = renderSetup({
      calculationMock: fullTimeHourlyMock,
    });

    expect(
      await findByLabelText('Open hours per week calculator'),
    ).toBeInTheDocument();
  });

  it('opens the hours per week calculator in the right panel when the icon is clicked', async () => {
    const { findByLabelText, findByText, queryByText } = renderSetup(
      { calculationMock: fullTimeHourlyMock },
      <RightPanelProbe />,
    );

    expect(queryByText('Hours Per Week Calculator')).not.toBeInTheDocument();

    userEvent.click(await findByLabelText('Open hours per week calculator'));

    expect(await findByText('Hours Per Week Calculator')).toBeInTheDocument();
  });

  it('hides Hours Worked and adapts validation when switching from Hourly to Salaried', async () => {
    const { findByRole, queryByRole, rerender } = renderSetup({
      calculationMock: { ...fullTimeHourlyMock, hoursWorkedPerWeek: null },
    });

    // Hours Worked is visible and required when Hourly
    const hoursInput = await findByRole('spinbutton', {
      name: 'Hours Worked',
    });
    expect(hoursInput).toBeInTheDocument();

    // Switch to Salaried — Hours Worked should disappear
    rerender(setupTree({ calculationMock: fullTimeSalariedMock }));

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
    const { findByRole, queryByRole, rerender } = renderSetup({
      calculationMock: { ...fullTimeHourlyMock, benefits: null },
    });

    // Benefits is visible and required when Full-time
    const benefitsInput = await findByRole('spinbutton', {
      name: 'Benefits',
    });
    expect(benefitsInput).toBeInTheDocument();

    // Switch to Part-time Hourly — Benefits should disappear
    rerender(setupTree({ calculationMock: partTimeHourlyMock }));

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

  it('renders both sentences of the Form Type helper text', async () => {
    const { findByText } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: DesignationSupportFormType.Detailed,
      },
    });

    expect(
      await findByText(/Default includes reimbursable expenses/),
    ).toBeInTheDocument();
    expect(await findByText(/Simple excludes them/)).toBeInTheDocument();
  });

  it('renders the Form Type select with both options', async () => {
    const { findByRole, getByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: DesignationSupportFormType.Detailed,
      },
    });

    const select = await findByRole('combobox', { name: /Form Type/ });
    await waitFor(() => expect(select).toHaveTextContent('Default'));
    userEvent.click(select);

    expect(getByRole('option', { name: 'Default' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Simple' })).toBeInTheDocument();
  });

  it('shows 403b Contribution Percentage field when formType is Detailed', async () => {
    const { findByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: DesignationSupportFormType.Detailed,
      },
    });

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeInTheDocument();
  });

  it('hides 403b Contribution Percentage field when formType is Simple', async () => {
    const { findByRole, queryByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: DesignationSupportFormType.Simple,
      },
    });

    // Wait for the Form Type select to reflect the loaded Simple value
    const formTypeSelect = await findByRole('combobox', { name: /Form Type/ });
    await waitFor(() => expect(formTypeSelect).toHaveTextContent('Simple'));

    expect(
      queryByRole('textbox', { name: '403b Contribution Percentage' }),
    ).not.toBeInTheDocument();
  });

  it('fires UpdatePdsGoalCalculation with formType when toggled to Simple', async () => {
    const { findByRole, getByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: DesignationSupportFormType.Detailed,
      },
      onCall: mutationSpy,
    });

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

  it('clears Pay Rate when switching from Hourly to Salaried', async () => {
    const { findByRole, getByRole } = renderSetup({
      calculationMock: fullTimeHourlyMock,
      onCall: mutationSpy,
    });

    const payTypeSelect = await findByRole('combobox', { name: /Pay Type/ });
    await waitFor(() => expect(payTypeSelect).toHaveTextContent('Hourly'));

    userEvent.click(payTypeSelect);
    userEvent.click(getByRole('option', { name: 'Salaried' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: null,
        },
      }),
    );
  });

  it('clears Pay Rate when switching from Salaried to Hourly', async () => {
    const { findByRole, getByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      onCall: mutationSpy,
    });

    const payTypeSelect = await findByRole('combobox', { name: /Pay Type/ });
    await waitFor(() => expect(payTypeSelect).toHaveTextContent('Salaried'));

    userEvent.click(payTypeSelect);
    userEvent.click(getByRole('option', { name: 'Hourly' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          salaryOrHourly: DesignationSupportSalaryType.Hourly,
          payRate: null,
        },
      }),
    );
  });

  it('disables Pay Type while a Pay Type save is in flight', async () => {
    const { findByRole, getByRole } = renderSetup({
      calculationMock: fullTimeSalariedMock,
      onCall: mutationSpy,
    });

    const payTypeSelect = await findByRole('combobox', { name: /Pay Type/ });
    await waitFor(() => expect(payTypeSelect).toHaveTextContent('Salaried'));

    userEvent.click(payTypeSelect);
    userEvent.click(getByRole('option', { name: 'Hourly' }));

    // While the mutation is in flight, the select is disabled so a concurrent
    // save cannot race the atomic salaryOrHourly + payRate: null write.
    await waitFor(() =>
      expect(payTypeSelect).toHaveAttribute('aria-disabled', 'true'),
    );
    // After the mutation resolves, the select is re-enabled.
    await waitFor(() =>
      expect(payTypeSelect).not.toHaveAttribute('aria-disabled', 'true'),
    );
  });

  it('does not fire a mutation when Pay Type is set to its current value', async () => {
    mutationSpy.mockClear();
    const { findByRole, getByRole } = renderSetup({
      calculationMock: fullTimeHourlyMock,
      onCall: mutationSpy,
    });

    const payTypeSelect = await findByRole('combobox', { name: /Pay Type/ });
    await waitFor(() => expect(payTypeSelect).toHaveTextContent('Hourly'));

    userEvent.click(payTypeSelect);
    userEvent.click(getByRole('option', { name: 'Hourly' }));

    // Yield to the microtask queue so any pending mutation would have fired.
    await new Promise((r) => setTimeout(r, 0));
    expect(mutationSpy).not.toHaveGraphqlOperation('UpdatePdsGoalCalculation');
  });

  it('shows the 403b Contribution Percentage field when formType is null (legacy goal)', async () => {
    const { findByRole } = renderSetup({
      calculationMock: {
        ...fullTimeSalariedMock,
        formType: null,
      },
    });

    expect(
      await findByRole('textbox', { name: '403b Contribution Percentage' }),
    ).toBeInTheDocument();
  });
});
