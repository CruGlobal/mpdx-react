import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { ReportLegendPopover } from './ReportLegendPopover';

const renderLegend = () =>
  render(
    <ThemeProvider theme={theme}>
      <ReportLegendPopover />
    </ThemeProvider>,
  );

const openLegend = async () => {
  const utils = renderLegend();
  userEvent.click(utils.getByRole('button', { name: 'How this report works' }));
  await utils.findByRole('heading', { name: 'How this report works' });
  return utils;
};

describe('ReportLegendPopover', () => {
  it('renders the How this report works button', () => {
    const { getByRole, queryByRole } = renderLegend();

    expect(
      getByRole('button', { name: 'How this report works' }),
    ).toBeInTheDocument();
    expect(queryByRole('heading', { name: 'Colors' })).not.toBeInTheDocument();
  });

  it('shows every section when opened', async () => {
    const { getByRole } = await openLegend();

    [
      'Colors',
      'Numbers',
      'Filters',
      'New Staff Monthly Salary (the goal)',
      'Fiscal quarters',
    ].forEach((name) =>
      expect(getByRole('heading', { name })).toBeInTheDocument(),
    );
  });

  it('explains each chip color beside a sample chip', async () => {
    const { getByText, getAllByText } = await openLegend();

    ['On track', 'Needs attention', 'At risk', 'No data'].forEach((label) =>
      expect(getByText(label)).toBeInTheDocument(),
    );
    // Sample chips use the row chip's amount formatting
    expect(getByText('$4,250.00')).toBeInTheDocument();
    expect(getAllByText('-').length).toBeGreaterThan(0);
  });

  it('matches the API grading order for red and green', async () => {
    const { getByText } = await openLegend();

    // Green is checked first, so red needs payroll below both benchmarks
    expect(getByText(/Payroll was below both benchmarks/)).toBeInTheDocument();
    expect(
      getByText(/can show green quarters yet still have negative months/),
    ).toBeInTheDocument();
  });

  it('defines the negative month filters', async () => {
    const { getByText } = await openLegend();

    expect(getByText('Negative last month')).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose payroll last month was below their New Staff Monthly Salary.',
      ),
    ).toBeInTheDocument();
    expect(getByText('Negative last 3+ months')).toBeInTheDocument();
    expect(
      getByText('The current month is never counted.'),
    ).toBeInTheDocument();
  });

  it('explains the New Staff Monthly Salary formula without mentioning debt', async () => {
    const { getByText, queryByText } = await openLegend();

    expect(
      getByText('Plus the 403(b) retirement contribution.'),
    ).toBeInTheDocument();
    // The report computes the New Staff salary with no debt payments
    expect(queryByText(/debt/i)).not.toBeInTheDocument();
  });

  it('explains the fiscal quarters', async () => {
    const { getByText, getByRole } = await openLegend();

    expect(getByText(/FQ1 26 is September–November 2025/)).toBeInTheDocument();
    expect(
      getByRole('row', { name: 'FQ1 September – November' }),
    ).toBeInTheDocument();
    expect(getByRole('row', { name: 'FQ4 June – August' })).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const { queryByRole } = await openLegend();

    userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'How this report works' }),
      ).not.toBeInTheDocument(),
    );
  });
});
