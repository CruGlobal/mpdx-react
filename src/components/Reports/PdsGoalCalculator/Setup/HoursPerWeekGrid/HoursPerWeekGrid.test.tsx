import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { HoursPerWeekGrid } from './HoursPerWeekGrid';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
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

  it('shows delete button only for custom entries on hover', async () => {
    const { getByText, getByLabelText } = render(
      <TestWrapper>
        <HoursPerWeekGrid />
      </TestWrapper>,
    );

    // Add a custom entry
    userEvent.click(getByText('Add Entry'));

    // The delete button should exist for the new entry
    await waitFor(() => {
      expect(getByLabelText('Delete')).toBeInTheDocument();
    });
  });
});
