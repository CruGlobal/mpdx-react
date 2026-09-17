import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { UpdateStaffGeographicLocationMutation } from '../GeographicLocationSelect/UpdateStaffGeographicLocation.generated';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { MonthlyPayrollSummaryQuery } from '../StaffDetailsTabs/MonthlySummary/MonthlyPayrollSummary.generated';
import { MonthlyPayrollHistoryQuery } from '../StaffDetailsTabs/Payroll/MonthlyPayrollHistory.generated';
import { ManagedStaffMember } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { StaffMemberDrawer } from './StaffMemberDrawer';

const geographicConstants = {
  constant: {
    mpdGoalBenefitsConstants: [{ id: 'benefits-1' }],
    mpdGoalGeographicConstants: [
      { location: 'None', percentageMultiplier: 0 },
      { location: 'Orlando, FL', percentageMultiplier: 0.06 },
      { location: 'New York, NY', percentageMultiplier: 0.12 },
    ],
    mpdGoalMiscConstants: [],
  },
};

const benchmarkWarning = 'MPD health cannot be graded without both benchmarks.';

const memberWithSpouse = managedStaffMember();

const memberWithoutSpouse = managedStaffMember({
  firstName: 'Alice',
  lastName: 'Jones',
  spouseFirstName: null,
  spouseLastName: null,
  personNumber: '10000003',
  staffAccountId: '1000000003',
});

let openMemberFn: (member: ManagedStaffMember) => void;

const Opener: React.FC = () => {
  const { openMember } = useMpdSupervisorReport();
  openMemberFn = openMember;
  return null;
};

interface TestComponentProps {
  monthlySummary?: MonthlyPayrollSummaryQuery['monthlyPayrollSummary'];
  payrollHistory?: MonthlyPayrollHistoryQuery['monthlyPayrollHistory'];
}

const renderDrawer = ({
  monthlySummary = [],
  payrollHistory = [],
}: TestComponentProps = {}) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            MonthlyPayrollSummary: MonthlyPayrollSummaryQuery;
            MonthlyPayrollHistory: MonthlyPayrollHistoryQuery;
            GoalCalculatorConstants: GoalCalculatorConstantsQuery;
            UpdateStaffGeographicLocation: UpdateStaffGeographicLocationMutation;
          }>
            mocks={{
              MonthlyPayrollSummary: { monthlyPayrollSummary: monthlySummary },
              MonthlyPayrollHistory: { monthlyPayrollHistory: payrollHistory },
              GoalCalculatorConstants: geographicConstants,
              UpdateStaffGeographicLocation: {
                updateManagedStaffGeographicLocation: {
                  geographicLocation: 'New York, NY',
                  newStaffMonthlySalary: 3000,
                },
              },
            }}
          >
            <MpdSupervisorReportProvider>
              <Opener />
              <StaffMemberDrawer />
            </MpdSupervisorReportProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </TestRouter>,
  );

const openMember = (member: ManagedStaffMember) => {
  act(() => {
    openMemberFn(member);
  });
};

describe('StaffMemberDrawer', () => {
  it('renders nothing when no member is selected', () => {
    const { container } = renderDrawer();
    expect(container.firstChild).toBeNull();
  });

  it('renders the member name and person number after openMember is called', () => {
    const { getByText } = renderDrawer();
    openMember(memberWithSpouse);
    expect(getByText('John Smith')).toBeInTheDocument();
    expect(getByText('10000001')).toBeInTheDocument();
    expect(getByText('1000000001')).toBeInTheDocument();
  });

  it('renders the spouse name and identifiers', () => {
    const { getByText } = renderDrawer();
    openMember(memberWithSpouse);
    expect(getByText(/Spouse:/)).toHaveTextContent('Spouse: Jane Smith');
    expect(getByText('10000002')).toBeInTheDocument();
    expect(getByText('1000000002')).toBeInTheDocument();
  });

  it('does not render the spouse section when no spouse is present', () => {
    const { getByText, queryByText } = renderDrawer();
    openMember(memberWithoutSpouse);
    expect(getByText('Alice Jones')).toBeInTheDocument();
    expect(queryByText(/Spouse:/)).not.toBeInTheDocument();
  });

  it('renders the benchmark labels and amounts', () => {
    const { getByText } = renderDrawer();
    openMember(memberWithSpouse);
    expect(getByText('MPD Health Benchmark:')).toBeInTheDocument();
    expect(getByText('Monthly Gross Salary')).toBeInTheDocument();
    expect(getByText('$4,500.00')).toBeInTheDocument();
    expect(getByText('New Staff Monthly Salary')).toBeInTheDocument();
    expect(getByText('$2,500.00')).toBeInTheDocument();
  });

  it('renders a zero benchmark as currency rather than a dash', () => {
    const { getAllByText } = renderDrawer();
    openMember(
      managedStaffMember({
        newStaffMonthlySalary: 0,
        quarterlyHealth: { monthlyGrossSalary: 0, completedQuarters: [] },
      }),
    );
    expect(getAllByText('$0.00')).toHaveLength(2);
  });

  it('omits the amount when the monthly gross salary is missing', () => {
    const { getByText, queryByText } = renderDrawer();
    openMember(
      managedStaffMember({
        quarterlyHealth: { monthlyGrossSalary: null, completedQuarters: [] },
      }),
    );
    expect(queryByText('$4,500.00')).not.toBeInTheDocument();
    expect(getByText('$2,500.00')).toBeInTheDocument();
  });

  it('omits the amount when the new staff monthly salary is missing', () => {
    const { getByText, queryByText } = renderDrawer();
    openMember(managedStaffMember({ newStaffMonthlySalary: null }));
    expect(queryByText('$2,500.00')).not.toBeInTheDocument();
    expect(getByText('$4,500.00')).toBeInTheDocument();
  });

  it('warns that health cannot be graded without the gross salary', () => {
    const { getByText } = renderDrawer();
    openMember(
      managedStaffMember({
        quarterlyHealth: { monthlyGrossSalary: null, completedQuarters: [] },
      }),
    );
    expect(getByText(benchmarkWarning)).toBeInTheDocument();
  });

  it('warns that health cannot be graded without the new staff salary', () => {
    const { getByText } = renderDrawer();
    openMember(managedStaffMember({ newStaffMonthlySalary: null }));
    expect(getByText(benchmarkWarning)).toBeInTheDocument();
  });

  it('does not warn about benchmarks when both are set', () => {
    const { queryByText } = renderDrawer();
    openMember(memberWithSpouse);
    expect(queryByText(benchmarkWarning)).not.toBeInTheDocument();
  });

  it('shows the selected member saved geographic location', async () => {
    const { findByRole } = renderDrawer();
    openMember(memberWithSpouse);
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).toHaveValue('Orlando, FL (6%)'));
  });

  it('updates the new staff monthly salary after saving a location', async () => {
    const { findByRole, getByRole, getByText, queryByText } = renderDrawer();
    openMember(memberWithSpouse);

    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(getByText('$3,000.00')).toBeInTheDocument());
    expect(queryByText('$2,500.00')).not.toBeInTheDocument();
  });

  it('renders all five detail tabs', () => {
    const { getByRole } = renderDrawer();
    openMember(memberWithSpouse);
    expect(getByRole('tab', { name: 'Monthly Summary' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Quarterly' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Payroll' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'MPGA Report' })).toBeInTheDocument();
    expect(
      getByRole('tab', { name: 'Staff Expense Report' }),
    ).toBeInTheDocument();
  });

  it('shows the Monthly Summary tab and its panel content by default', async () => {
    const { getByRole } = renderDrawer({
      monthlySummary: [
        {
          month: '2023-01',
          contributions: 4000,
          expenses: 3500,
          net: 500,
          endBalance: 10000,
        },
      ],
    });
    openMember(memberWithSpouse);
    expect(getByRole('tab', { name: 'Monthly Summary' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    const table = await within(getByRole('tabpanel')).findByRole('table');
    expect(table).toHaveTableStructure({
      columnHeaders: [
        'Month',
        'Contributions',
        'Expenses',
        'Net',
        'End Balance',
      ],
      cells: [
        ['Jan 2023', '$4,000.00', '($3,500.00)', '$500.00', '$10,000.00'],
      ],
    });
  });

  it('selects another tab when clicked', async () => {
    const { getByRole } = renderDrawer();
    openMember(memberWithSpouse);
    userEvent.click(getByRole('tab', { name: 'Quarterly' }));
    expect(getByRole('tab', { name: 'Quarterly' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(getByRole('tab', { name: 'Monthly Summary' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('renders the payroll history on the Payroll tab', async () => {
    const { getByRole } = renderDrawer({
      payrollHistory: [
        {
          month: '2023-01',
          payroll: 3000,
          asrAndReimbursements: 700,
          percentMaxPay: 80,
        },
      ],
    });
    openMember(memberWithSpouse);

    userEvent.click(getByRole('tab', { name: 'Payroll' }));

    const table = await within(getByRole('tabpanel')).findByRole('table');
    expect(table).toHaveTableStructure({
      columnHeaders: [
        'Month',
        'Payroll',
        'Reimbursement / Additional Salary',
        '% Max Pay',
      ],
      cells: [['Jan 2023', '$3,000.00', '$700.00', '80.0%']],
    });
  });

  it('closes the panel when the close button is clicked', async () => {
    const { getByRole, getByText, queryByText } = renderDrawer();
    openMember(memberWithSpouse);
    expect(getByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(queryByText('John Smith')).not.toBeInTheDocument();
  });
});
