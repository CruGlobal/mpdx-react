import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { EmployeeData, QuarterHealthEnum } from '../mockData';
import { StaffMemberDrawer } from './StaffMemberDrawer';

const memberWithSpouse: EmployeeData = {
  user: {
    id: '1',
    preferredName: 'John',
    lastName: 'Smith',
    personNumber: '10000001',
    staffAccountID: '1000000001',
    userPersonType: 'Full time',
    team: 'Campus',
  },
  spouse: {
    id: '2',
    preferredName: 'Jane',
    lastName: 'Smith',
    personNumber: '10000002',
    staffAccountID: '1000000002',
  },
  quarters: [
    { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ1 26', health: QuarterHealthEnum.Yellow, payroll: 15000 },
    { label: 'FQ2 26', health: QuarterHealthEnum.Red, payroll: 15000 },
    { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 15000 },
  ],
};

const memberWithoutSpouse: EmployeeData = {
  user: {
    id: '3',
    preferredName: 'Alice',
    lastName: 'Jones',
    personNumber: '10000003',
    staffAccountID: '1000000003',
    userPersonType: 'Part time',
    team: 'Digital strategies',
  },
  quarters: [
    { label: 'FQ4 25', health: QuarterHealthEnum.Red, payroll: 15000 },
    { label: 'FQ1 26', health: QuarterHealthEnum.Red, payroll: 15000 },
    { label: 'FQ2 26', health: QuarterHealthEnum.Red, payroll: 15000 },
    { label: 'FQ3 26', health: QuarterHealthEnum.Red, payroll: 15000 },
  ],
};

let openMemberFn: (member: EmployeeData) => void;

const Opener: React.FC = () => {
  const { openMember } = useMpdSupervisorReport();
  openMemberFn = openMember;
  return null;
};

const renderDrawer = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <MpdSupervisorReportProvider>
          <Opener />
          <StaffMemberDrawer />
        </MpdSupervisorReportProvider>
      </ThemeProvider>
    </TestRouter>,
  );

const openMember = (member: EmployeeData) => {
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
    renderDrawer();
    openMember(memberWithSpouse);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('10000001')).toBeInTheDocument();
    expect(screen.getByText('1000000001')).toBeInTheDocument();
  });

  it('renders the spouse section when a spouse is present', () => {
    renderDrawer();
    openMember(memberWithSpouse);
    expect(screen.getByText(/Spouse:/)).toHaveTextContent('Spouse: Jane Smith');
    expect(screen.getByText('10000002')).toBeInTheDocument();
  });

  it('does not render the spouse section when no spouse is present', () => {
    renderDrawer();
    openMember(memberWithoutSpouse);
    expect(screen.getByText('Alice Jones')).toBeInTheDocument();
    expect(screen.queryByText(/Spouse:/)).not.toBeInTheDocument();
  });

  it('renders all five detail tabs', () => {
    renderDrawer();
    openMember(memberWithSpouse);
    expect(
      screen.getByRole('tab', { name: 'Monthly Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Quarterly' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Payroll' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'MPGA Report' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Staff Expense Report' }),
    ).toBeInTheDocument();
  });

  it('shows the Monthly Summary tab and its panel content by default', () => {
    renderDrawer();
    openMember(memberWithSpouse);
    expect(
      screen.getByRole('tab', { name: 'Monthly Summary' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('tabpanel')).getByText('Monthly Summary'),
    ).toBeInTheDocument();
  });

  it('selects another tab when clicked', async () => {
    renderDrawer();
    openMember(memberWithSpouse);
    await userEvent.click(screen.getByRole('tab', { name: 'Quarterly' }));
    expect(screen.getByRole('tab', { name: 'Quarterly' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('tab', { name: 'Monthly Summary' }),
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('closes the panel when the close button is clicked', async () => {
    renderDrawer();
    openMember(memberWithSpouse);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });
});
