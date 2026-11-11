import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { ReportLegendButton } from './ReportLegendButton';
import { ReportLegendPanel } from './ReportLegendPanel';

// Mirrors the page: the (i) button opens the legend in the right panel, and a
// staff member and the legend never share it.
const Harness: React.FC = () => {
  const { legendOpen, isOpen, openMember } = useMpdSupervisorReport();
  return (
    <>
      <ReportLegendButton />
      <button onClick={() => openMember(managedStaffMember())}>
        Open member
      </button>
      <span data-testid="member-open">{String(isOpen)}</span>
      {legendOpen && <ReportLegendPanel />}
    </>
  );
};

const renderHarness = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <MpdSupervisorReportProvider>
            <Harness />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

const openLegend = async () => {
  const utils = renderHarness();
  userEvent.click(utils.getByRole('button', { name: 'How this report works' }));
  await utils.findByRole('heading', { name: 'How this report works' });
  return utils;
};

describe('ReportLegendPanel', () => {
  it('is closed until the How this report works button is clicked', () => {
    const { getByRole, queryByRole } = renderHarness();

    expect(
      getByRole('button', { name: 'How this report works' }),
    ).toBeInTheDocument();
    expect(queryByRole('heading', { name: 'Colors' })).not.toBeInTheDocument();
  });

  it('shows every section when opened', async () => {
    const { getByRole } = await openLegend();

    [
      'Colors',
      'Quarter colors (staff details)',
      'Numbers',
      'Filters',
      'New Staff Monthly Salary (the goal)',
      'Fiscal quarters',
    ].forEach((name) =>
      expect(getByRole('heading', { name })).toBeInTheDocument(),
    );
  });

  it('explains each quarter chip color beside a sample chip', async () => {
    const { getByText, getAllByText } = await openLegend();

    ['On track', 'Needs attention', 'At risk', 'Ungraded'].forEach((label) =>
      expect(getByText(label)).toBeInTheDocument(),
    );
    // Sample chips use the row chip's amount formatting
    expect(getByText('$4,250.00')).toBeInTheDocument();
    expect(getAllByText('-').length).toBeGreaterThan(0);
  });

  it('explains that part-time field staff and volunteers are not graded', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(/Part-time field staff and volunteers aren't graded/),
    ).toBeInTheDocument();
    // Ungraded quarters still have real payroll, unlike No data
    expect(getByText('$2,000.00')).toBeInTheDocument();
  });

  it('matches the API grading for red and green', async () => {
    const { getByText, queryByText } = await openLegend();

    // MPDX-10112: payroll below the New Staff salary is red even at full gross salary
    expect(
      getByText(
        /Payroll was below their New Staff Monthly Salary, even if they were paid their full Monthly Gross Salary\. Interns are never at risk\./,
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        /Payroll was at or above their Monthly Gross Salary \(within \$5\) and their New Staff Monthly Salary\. For interns, payroll was at or above their Monthly Gross Salary \(within \$5\)\./,
      ),
    ).toBeInTheDocument();
    expect(queryByText(/below both benchmarks/)).not.toBeInTheDocument();
    expect(queryByText(/can show green quarters/)).not.toBeInTheDocument();
  });

  it('defines the quick filters', async () => {
    const { getByText } = await openLegend();

    expect(getByText('Negative last month')).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose staff account balance was below zero at the end of last month.',
      ),
    ).toBeInTheDocument();
    expect(getByText('Negative last 3 months')).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose staff account balance was below zero at the end of each of the last three months.',
      ),
    ).toBeInTheDocument();
    expect(getByText('Negative 3+ months in past year')).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose staff account balance was below zero at the end of at least three of the last 12 months.',
      ),
    ).toBeInTheDocument();
    expect(
      getByText('Spending more than income last 3 months'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose expenses were greater than their income in each of the last three months.',
      ),
    ).toBeInTheDocument();
    expect(getByText('Below New Staff Monthly Salary')).toBeInTheDocument();
    expect(
      getByText(
        'Staff whose average monthly payroll in the last completed quarter was below their New Staff Monthly Salary. Their newest quarter is red in their details.',
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        "The current month is never counted. Last month's balance can still change for a few weeks as late items post.",
      ),
    ).toBeInTheDocument();
  });

  it('says quarter colors measure pay and live in the staff details', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        "Quarter colors measure pay, not the staff account balance. They show at the top of each staff member's details.",
      ),
    ).toBeInTheDocument();
  });

  it('points red quarters to the New Staff salary filter', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        'To list staff whose newest quarter is red, use the Below New Staff Monthly Salary filter.',
      ),
    ).toBeInTheDocument();
  });

  it('explains a dash as any value the report does not have', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(/no Personal CAP to measure pay against/),
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

  it('says interns are graded on gross salary only in the quarter colors', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        /^Each quarter chip in a staff member's details .* Interns are graded against their Monthly Gross Salary only, and part-time field staff and volunteers aren't graded\./,
      ),
    ).toBeInTheDocument();
  });

  it('explains what needs attention means for interns', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(/For interns, payroll was below their Monthly Gross Salary\./),
    ).toBeInTheDocument();
  });

  it('sorts by the lowest balance at the end of last month', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        'Lowest balance at the end of last month first, across all staff. Staff with no balance for that month are listed last. Ties are sorted alphabetically by last name.',
      ),
    ).toBeInTheDocument();
  });

  it('says the negative month filters leave out ungraded and intern staff', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(
        'These filters leave out interns, part-time field staff and volunteers.',
      ),
    ).toBeInTheDocument();
  });

  it('says interns, part-time field staff and volunteers have no Geographic Multiplier', async () => {
    const { getByText } = await openLegend();

    expect(
      getByText(/so they have no Geographic Multiplier to change\./),
    ).toBeInTheDocument();
  });

  it('explains the fiscal quarters', async () => {
    const { getByText, getByRole } = await openLegend();

    expect(getByText(/FQ1 26 is September–November 2025/)).toBeInTheDocument();
    expect(
      getByRole('row', { name: 'FQ1 September – November' }),
    ).toBeInTheDocument();
    expect(getByRole('row', { name: 'FQ4 June – August' })).toBeInTheDocument();
  });

  it('closes from its Close Panel button', async () => {
    const { getByRole, queryByRole } = await openLegend();

    userEvent.click(getByRole('button', { name: 'Close Panel' }));

    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'How this report works' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('gives way to a staff member and closes them when reopened', async () => {
    const { getByRole, getByTestId, queryByRole, findByRole } =
      await openLegend();

    userEvent.click(getByRole('button', { name: 'Open member' }));
    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'How this report works' }),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('member-open')).toHaveTextContent('true');

    userEvent.click(getByRole('button', { name: 'How this report works' }));
    await findByRole('heading', { name: 'How this report works' });
    expect(getByTestId('member-open')).toHaveTextContent('false');
  });
});
