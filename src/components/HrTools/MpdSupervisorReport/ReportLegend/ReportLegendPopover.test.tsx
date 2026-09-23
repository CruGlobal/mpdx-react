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

    ['Colors', 'Numbers', 'New Staff goal', 'Fiscal quarters'].forEach((name) =>
      expect(getByRole('heading', { name })).toBeInTheDocument(),
    );
  });

  it('explains each chip color', async () => {
    const { getByText } = await openLegend();

    ['On track', 'Needs attention', 'At risk', 'No data'].forEach((label) =>
      expect(getByText(label)).toBeInTheDocument(),
    );
  });

  it('matches the API grading order for red and green', async () => {
    const { getByText } = await openLegend();

    // Green is checked first, so red needs payroll below both benchmarks
    expect(
      getByText(
        /below both their Monthly Gross Salary and their New Staff Monthly Salary/,
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        /can be green even though its months are counted as negative months/,
      ),
    ).toBeInTheDocument();
  });

  it('defines a negative month', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        'A complete month in which payroll was below the New Staff Monthly Salary. The current month is not counted.',
      ),
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
    const { getByText } = await openLegend();

    expect(getByText(/FQ1 26 is September–November 2025/)).toBeInTheDocument();
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
