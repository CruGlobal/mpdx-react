import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../../PdsGoalCalculatorTestWrapper';
import { HoursPerWeekGrid } from './HoursPerWeekGrid';

const defaultCalculationMock: PdsGoalCalculationMock = {
  id: 'goal-1',
  designationSupportHoursItems: [
    {
      id: 'item-regular',
      label: 'Regular Week',
      hoursPerWeek: 40,
      numberOfWeeks: 48,
      name: 'regular',
      position: 0,
      predefined: true,
    },
    {
      id: 'item-travel',
      label: 'Travel',
      hoursPerWeek: 0,
      numberOfWeeks: 0,
      name: 'travel',
      position: 1,
      predefined: true,
    },
    {
      id: 'item-vacation',
      label: 'Unpaid Vacation',
      hoursPerWeek: 0,
      numberOfWeeks: 0,
      name: 'vacation',
      position: 2,
      predefined: true,
    },
  ],
};

const mutationSpy = jest.fn();

describe('HoursPerWeekGrid', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('renders the grid correctly', async () => {
    const { findByText, getByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Hours Per Week Calculator')).toBeInTheDocument();
    expect(await findByText('Regular Week')).toBeInTheDocument();
    expect(getByText('Travel')).toBeInTheDocument();
    expect(getByText('Unpaid Vacation')).toBeInTheDocument();
    expect(getByText('Total')).toBeInTheDocument();
    expect(getByText('Average Hours Worked Per Week')).toBeInTheDocument();
  });

  it('calculates average hours per week from server values', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Regular Week 40hrs * 48wks = 1920 total hours, 48 total weeks
    // Average = 1920 / 48 = 40.00
    expect(await findByText('40.00')).toBeInTheDocument();
  });

  it('adds a new entry when clicking add button', async () => {
    const { findByText, getByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Regular Week');
    userEvent.click(getByText('Add Entry'));

    expect(await findByText('New Entry')).toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'CreateDesignationSupportHoursItem',
        {
          attributes: {
            designationSupportCalculationId: 'goal-1',
            label: 'New Entry',
            hoursPerWeek: 0,
            numberOfWeeks: 0,
            position: 3,
          },
        },
      ),
    );
  });

  it('does not show Apply button when onApply is not provided', async () => {
    const { findByText, queryByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Regular Week');
    expect(queryByText('Apply to Hours Worked')).not.toBeInTheDocument();
  });

  it('shows warning and disables Apply when weeks do not add up to 52', async () => {
    const onApply = jest.fn();
    const { findByText, getByText, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid onApply={onApply} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Regular Week');

    // Default entries have 48 weeks total, 4 remaining
    expect(
      getByText(/Weeks must add up to 52. 4 week\(s\) remaining./),
    ).toBeInTheDocument();

    const applyButton = getByRole('button', { name: 'Apply to Hours Worked' });
    expect(applyButton).toBeDisabled();
  });

  it('sends correct mutation variables on cell edit', async () => {
    const { findByText, getByDisplayValue } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Edit Regular Week hours from 40 to 20
    const regularRow = (await findByText('Regular Week')).closest(
      '[role="row"]',
    );
    const hoursCell = regularRow?.querySelector('[data-field="hoursPerWeek"]');
    userEvent.dblClick(hoursCell!);

    await waitFor(() => {
      const input = getByDisplayValue('40');
      userEvent.clear(input);
      userEvent.type(input, '20');
    });
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateDesignationSupportHoursItem',
        {
          attributes: {
            id: 'item-regular',
            designationSupportCalculationId: 'goal-1',
            label: 'Regular Week',
            hoursPerWeek: 20,
            numberOfWeeks: 48,
          },
        },
      ),
    );
  });

  it('autosaves averageHoursPerWeek via UpdatePdsGoalCalculation after cell edit', async () => {
    const { findByText, getByDisplayValue } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Edit Regular Week hours from 40 to 20
    const regularRow = (await findByText('Regular Week')).closest(
      '[role="row"]',
    );
    const hoursCell = regularRow?.querySelector('[data-field="hoursPerWeek"]');
    userEvent.dblClick(hoursCell!);

    await waitFor(() => {
      const input = getByDisplayValue('40');
      userEvent.clear(input);
      userEvent.type(input, '20');
    });
    userEvent.tab();

    // Average = 20 hrs * 48 wks / 48 wks = 20.00
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          averageHoursPerWeek: 20,
        },
      }),
    );
  });

  it('enables Apply when weeks add up to 52', async () => {
    const onApply = jest.fn();
    const { findByText, getByDisplayValue, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid onApply={onApply} />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Edit Travel weeks from 0 to 4 (48 + 4 = 52)
    const travelRow = (await findByText('Travel')).closest('[role="row"]');
    const weeksCell = travelRow?.querySelector('[data-field="weeks"]');
    userEvent.dblClick(weeksCell!);

    await waitFor(() => {
      const input = getByDisplayValue('0');
      userEvent.clear(input);
      userEvent.type(input, '4');
    });
    userEvent.tab();

    // Warning should disappear and Apply should be enabled
    await waitFor(() => {
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });

    const applyButton = getByRole('button', { name: 'Apply to Hours Worked' });
    expect(applyButton).not.toBeDisabled();

    userEvent.click(applyButton);
    expect(onApply).toHaveBeenCalled();
  });

  it('rounds the applied average to two decimal places', async () => {
    const onApply = jest.fn();
    const { findByText, getByDisplayValue, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid onApply={onApply} />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Edit Travel weeks from 0 to 4 (48 + 4 = 52 total)
    const travelRow = (await findByText('Travel')).closest('[role="row"]');
    const travelWeeksCell = travelRow?.querySelector('[data-field="weeks"]');
    userEvent.dblClick(travelWeeksCell!);
    await waitFor(() => {
      const input = getByDisplayValue('0');
      userEvent.clear(input);
      userEvent.type(input, '4');
    });
    userEvent.tab();

    // Edit Travel hours from 0 to 7 — average becomes (40*48 + 7*4) / 52 = 37.4615...
    await waitFor(() => {
      const travelHoursCell = travelRow?.querySelector(
        '[data-field="hoursPerWeek"]',
      );
      userEvent.dblClick(travelHoursCell!);
    });
    await waitFor(() => {
      const input = getByDisplayValue('0');
      userEvent.clear(input);
      userEvent.type(input, '7');
    });
    userEvent.tab();

    const applyButton = getByRole('button', { name: 'Apply to Hours Worked' });
    await waitFor(() => expect(applyButton).not.toBeDisabled());
    userEvent.click(applyButton);

    expect(onApply).toHaveBeenCalledWith(37.46);
  });

  it('shows delete button only for custom entries on hover', async () => {
    const { findByText, findByLabelText, getByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Regular Week');
    userEvent.click(getByText('Add Entry'));

    expect(await findByLabelText('Delete')).toBeInTheDocument();
  });

  it('renders 0.00 (not NaN) when total weeks is zero', async () => {
    const { findByText, findAllByText, getByDisplayValue, queryByText } =
      render(
        <PdsGoalCalculatorTestWrapper
          calculationMock={defaultCalculationMock}
          onCall={mutationSpy}
        >
          <HoursPerWeekGrid />
        </PdsGoalCalculatorTestWrapper>,
      );

    const regularRow = (await findByText('Regular Week')).closest(
      '[role="row"]',
    );
    const weeksCell = regularRow?.querySelector('[data-field="weeks"]');
    userEvent.dblClick(weeksCell!);

    await waitFor(() => {
      const input = getByDisplayValue('48');
      userEvent.clear(input);
      userEvent.type(input, '0');
    });
    userEvent.tab();

    await waitFor(() => {
      expect(queryByText('NaN')).not.toBeInTheDocument();
    });
    expect((await findAllByText('0.00')).length).toBeGreaterThan(0);
  });

  it('clamps weeks to 52 total across all entries', async () => {
    const { findByText, getByDisplayValue } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Default: Regular Week has 48 weeks, Travel and Vacation have 0
    // Edit Travel weeks to 10 — should be clamped to 4 (52 - 48 = 4 remaining)
    const travelRow = (await findByText('Travel')).closest('[role="row"]');
    const weeksCell = travelRow?.querySelector('[data-field="weeks"]');
    userEvent.dblClick(weeksCell!);

    await waitFor(() => {
      const input = getByDisplayValue('0');
      userEvent.clear(input);
      userEvent.type(input, '10');
    });
    userEvent.tab();

    // The weeks value should be clamped to 4, so total weeks = 48 + 4 = 52
    await waitFor(() => {
      const travelWeeksCell = travelRow?.querySelector('[data-field="weeks"]');
      expect(travelWeeksCell).toHaveTextContent('4');
    });
  });

  it('removes the row and recomputes the average when delete is clicked', async () => {
    const { getByText, queryByText, getByLabelText, findByText } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={defaultCalculationMock}
        onCall={mutationSpy}
      >
        <HoursPerWeekGrid />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Regular Week');
    userEvent.click(getByText('Add Entry'));
    expect(await findByText('New Entry')).toBeInTheDocument();

    userEvent.click(getByLabelText('Delete'));

    await waitFor(() => {
      expect(queryByText('New Entry')).not.toBeInTheDocument();
    });
    // Default Regular Week 40*48/48 = 40.00 remains
    expect(getByText('40.00')).toBeInTheDocument();
  });
});
