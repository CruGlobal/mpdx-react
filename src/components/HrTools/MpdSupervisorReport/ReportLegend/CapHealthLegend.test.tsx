import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdSupervisorReportProvider } from '../MpdSupervisorReportContext';
import { ReportLegendPanel } from './ReportLegendPanel';

const renderLegend = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <MpdSupervisorReportProvider>
            <ReportLegendPanel />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

// MPDX-10323
describe('ReportLegendPanel health badge', () => {
  it('explains the health badge and each grade', () => {
    const { getByRole } = renderLegend();

    const section = getByRole('region', { name: 'Health badge' });
    expect(section).toHaveTextContent(
      "The badge beside each name grades last month's payroll as a percent of their Personal CAP, the % of Personal CAP on the Payroll tab. It is separate from the quarter colors.",
    );
    expect(
      within(section)
        .getAllByTestId('cap-health-badge')
        .map((badge) => badge.textContent),
    ).toEqual(['Healthy', 'On Track', 'Needs Attention']);
    expect(section).toHaveTextContent(
      "Staff get no badge and match none of these filters without a Personal CAP, in their first payroll month, or when last month's figures aren't in yet. The current month is never graded.",
    );
  });

  // The sample badges are hidden from screen readers, so each description
  // must name its grade itself
  it('names the grade in each description', () => {
    const { getByRole } = renderLegend();

    const section = getByRole('region', { name: 'Health badge' });
    expect(
      within(section)
        .getAllByTestId('cap-health-description')
        .map((description) => description.textContent),
    ).toEqual([
      'Healthy: Staff whose payroll last month was 65% or more of their Personal CAP.',
      'On Track: Staff whose payroll last month was 50% to under 65% of their Personal CAP.',
      'Needs Attention: Staff whose payroll last month was under 50% of their Personal CAP.',
    ]);
  });

  it('lists the health chips with the filters, which still grade interns', () => {
    const { getByRole } = renderLegend();

    const filters = getByRole('heading', { name: 'Filters' })
      .parentElement as HTMLElement;
    expect(filters).toHaveTextContent(
      'The Negative and Spending filters leave out interns, part-time field staff and volunteers.',
    );
    expect(
      within(filters).getByText('Needs Attention', { selector: 'dt' }),
    ).toBeInTheDocument();
  });
});
