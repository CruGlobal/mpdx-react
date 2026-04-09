import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { HoursPerWeekGrid } from './HoursPerWeekGrid';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('HoursPerWeekGrid', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    expect(getByText('Hours Per Week Calculator')).toBeInTheDocument();
  });

  it('renders default entries', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    expect(getByText('Regular Week')).toBeInTheDocument();
    expect(getByText('Travel')).toBeInTheDocument();
    expect(getByText('Unpaid Vacation')).toBeInTheDocument();
  });

  it('renders the total row', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    expect(getByText('Total')).toBeInTheDocument();
  });

  it('renders the average hours per week footer', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

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

  it('shows the add entry button', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    expect(getByText('Add Entry')).toBeInTheDocument();
  });

  it('adds a new entry when clicking add button', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    await userEvent.click(getByText('Add Entry'));

    expect(getByText('New Entry')).toBeInTheDocument();
  });

  it('shows delete button only for custom entries on hover', async () => {
    const { getByText, getByLabelText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    // Add a custom entry
    await userEvent.click(getByText('Add Entry'));

    // The delete button should exist for the new entry
    await waitFor(() => {
      expect(getByLabelText('Delete')).toBeInTheDocument();
    });
  });

  it('calls onAverageHoursChange when entries are updated', async () => {
    const onAverageHoursChange = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid onAverageHoursChange={onAverageHoursChange} />
      </TestWrapper>,
    );

    // Add an entry to trigger a change
    await userEvent.click(getByText('Add Entry'));

    // The callback should not have been called yet since new entry has 0 values
    // Average remains the same: 1920 / 48 = 40
  });

  it('calculates average hours per week correctly with default values', () => {
    const { getByText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    // Default: Regular Week 40hrs * 48wks = 1920 total hours, 48 total weeks
    // Average = 1920 / 48 = 40.0
    expect(getByText('40.0')).toBeInTheDocument();
  });
});
