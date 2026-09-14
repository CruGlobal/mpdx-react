import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ManagedStaffMember } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { StaffMember } from './StaffMember';

const member = managedStaffMember({
  firstName: 'Brooke',
  lastName: 'Butler',
  teams: {
    employee: [
      { id: 'team-1', name: 'FamilyLife', department: 'US FamilyLife' },
    ],
    spouse: [],
  },
});

const renderRow = (onClick = jest.fn(), data: ManagedStaffMember = member) => ({
  onClick,
  ...render(
    <ThemeProvider theme={theme}>
      <StaffMember data={data} onClick={onClick} />
    </ThemeProvider>,
  ),
});

describe('StaffMember', () => {
  it('renders the staff member name as "{firstName} {lastName}"', () => {
    const { getByText } = renderRow();
    expect(getByText('Brooke Butler')).toBeInTheDocument();
  });

  it('renders the staff account, employment type, and team line', () => {
    const { getByTestId } = renderRow();
    expect(getByTestId('person-numbers')).toHaveTextContent(
      '1000000001 · — · FamilyLife',
    );
  });

  it('dashes the staff account when the API has none', () => {
    const { getByTestId } = renderRow(
      jest.fn(),
      managedStaffMember({ staffAccountId: null }),
    );
    expect(getByTestId('person-numbers')).toHaveTextContent('— · —');
  });

  it('joins the names when a member is on several teams', () => {
    const { getByTestId } = renderRow(
      jest.fn(),
      managedStaffMember({
        teams: {
          employee: [
            { id: 'team-1', name: 'Campus', department: null },
            { id: 'team-2', name: 'Cru City', department: null },
          ],
          spouse: [],
        },
      }),
    );
    expect(getByTestId('person-numbers')).toHaveTextContent('Campus, Cru City');
  });

  it('renders a currency-formatted payroll chip for each quarter', () => {
    const { getByText } = renderRow();
    expect(getByText('$4,600.00')).toBeInTheDocument();
    expect(getByText('$3,500.00')).toBeInTheDocument();
    expect(getByText('$2,200.00')).toBeInTheDocument();
    expect(getByText('$4,500.00')).toBeInTheDocument();
  });

  it('labels a quarter payroll started partway through as Partial', () => {
    const { getByText } = renderRow(
      jest.fn(),
      managedStaffMember({
        quarterlyHealth: {
          monthlyGrossSalary: 4500,
          completedQuarters: [],
          startingQuarter: { fiscalYear: 2026, quarter: 3, months: [] },
        },
      }),
    );
    expect(getByText('Partial')).toBeInTheDocument();
  });

  it('renders a dash instead of $0.00 for a quarter with no payroll data', () => {
    const { getByText, queryByText } = renderRow(
      jest.fn(),
      managedStaffMember({
        quarterlyHealth: {
          monthlyGrossSalary: 0,
          startingQuarter: null,
          completedQuarters: [
            {
              fiscalYear: 2025,
              quarter: 4,
              averagePayroll: 0,
              status: MpdHealthStatusEnum.Gray,
            },
          ],
        },
      }),
    );

    expect(getByText('-')).toBeInTheDocument();
    expect(queryByText('$0.00')).not.toBeInTheDocument();
    expect(getByText('FQ4 25, no data')).toBeInTheDocument();
  });

  it('exposes an accessible button with a descriptive label', () => {
    const { getByRole } = renderRow();
    expect(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const { onClick, getByRole } = renderRow();
    userEvent.click(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the card as a real button so the keyboard can activate it', () => {
    const { getByRole } = renderRow();
    expect(
      getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toHaveProperty('tagName', 'BUTTON');
  });
});
