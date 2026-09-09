import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { MonthlyPayrollSummaryQuery } from '../StaffDetailsTabs/MonthlySummary/MonthlyPayrollSummary.generated';
import { MonthlyPayrollHistoryQuery } from '../StaffDetailsTabs/Payroll/MonthlyPayrollHistory.generated';
import { ManagedStaffMember } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { StaffMemberDrawer } from './StaffMemberDrawer';

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
        <GqlMockedProvider<{
          MonthlyPayrollSummary: MonthlyPayrollSummaryQuery;
          MonthlyPayrollHistory: MonthlyPayrollHistoryQuery;
        }>
          mocks={{
            MonthlyPayrollSummary: { monthlyPayrollSummary: monthlySummary },
            MonthlyPayrollHistory: { monthlyPayrollHistory: payrollHistory },
          }}
        >
          <MpdSupervisorReportProvider>
            <Opener />
            <StaffMemberDrawer />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
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
