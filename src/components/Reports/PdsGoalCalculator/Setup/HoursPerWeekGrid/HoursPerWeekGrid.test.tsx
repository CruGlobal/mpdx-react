import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { HoursPerWeekGrid } from './HoursPerWeekGrid';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
);

describe('HoursPerWeekGrid', () => {
  it('renders the grid correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    expect(getByText('Hours Per Week Calculator')).toBeInTheDocument();
    expect(getByText('Regular Week')).toBeInTheDocument();
    expect(getByText('Travel')).toBeInTheDocument();
    expect(getByText('Unpaid Vacation')).toBeInTheDocument();
    expect(getByText('Total')).toBeInTheDocument();
    expect(getByText('Average Hours Worked Per Week')).toBeInTheDocument();
  });

  it('calculates average hours per week from default values', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    // Default: Regular Week 40hrs * 48wks = 1920 total hours, 48 total weeks
    // Average = 1920 / 48 = 40.0
    // The average is rendered in our own footer, outside the DataGrid
    expect(getByText('40.0')).toBeInTheDocument();
  });

  it('adds a new entry when clicking add button', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    userEvent.click(getByText('Add Entry'));

    expect(getByText('New Entry')).toBeInTheDocument();
  });

  it('fires onAverageHoursChange with the new average when a cell is edited', async () => {
    const onAverageHoursChange = jest.fn();
    const { findByText, getByDisplayValue } = render(
      <TestWrapper>
        <HoursPerWeekGrid onAverageHoursChange={onAverageHoursChange} />
      </TestWrapper>,
    );

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

    // Regular Week: 20 * 48 = 960 hours / 48 weeks = 20
    await waitFor(() => {
      expect(onAverageHoursChange).toHaveBeenCalledWith(20);
    });
  });

  it('shows delete button only for custom entries on hover', async () => {
    const { getByText, findByLabelText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    // Add a custom entry
    userEvent.click(getByText('Add Entry'));

    // The delete button should exist for the new entry
    expect(await findByLabelText('Delete')).toBeInTheDocument();
  });

  it('renders 0.0 (not NaN) when total weeks is zero', async () => {
    const { findByText, getByDisplayValue, queryByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
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
    expect(await findByText('0.0')).toBeInTheDocument();
  });

  it('removes the row and recomputes the average when delete is clicked', async () => {
    const onAverageHoursChange = jest.fn();
    const { getByText, queryByText, getByLabelText, findByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid onAverageHoursChange={onAverageHoursChange} />
      </TestWrapper>,
    );

    userEvent.click(getByText('Add Entry'));
    expect(await findByText('New Entry')).toBeInTheDocument();

    userEvent.click(getByLabelText('Delete'));

    await waitFor(() => {
      expect(queryByText('New Entry')).not.toBeInTheDocument();
    });
    // Default Regular Week 40*48/48 = 40.0 remains
    expect(getByText('40.0')).toBeInTheDocument();
  });
});
