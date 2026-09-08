import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currencyFormat } from 'src/lib/intlFormat';
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

const renderRow = (onClick = jest.fn(), data: ManagedStaffMember = member) => {
  render(
    <ThemeProvider theme={theme}>
      <StaffMember data={data} onClick={onClick} />
    </ThemeProvider>,
  );
  return onClick;
};

describe('StaffMember', () => {
  it('renders the staff member name as "{firstName} {lastName}"', () => {
    renderRow();
    expect(screen.getByText('Brooke Butler')).toBeInTheDocument();
  });

  it('renders the staff account, employment type, and team line', () => {
    renderRow();
    expect(screen.getByTestId('person-numbers')).toHaveTextContent(
      '1000000001 · — · FamilyLife',
    );
  });

  it('dashes the staff account when the API has none', () => {
    renderRow(jest.fn(), managedStaffMember({ staffAccountId: null }));
    expect(screen.getByTestId('person-numbers')).toHaveTextContent('— · —');
  });

  it('joins the names when a member is on several teams', () => {
    renderRow(
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
    expect(screen.getByTestId('person-numbers')).toHaveTextContent(
      'Campus, Cru City',
    );
  });

  it('renders a currency-formatted payroll chip for each quarter', () => {
    renderRow();
    expect(
      screen.getByText(currencyFormat(15000, 'USD', 'en-US')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(currencyFormat(16000, 'USD', 'en-US')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(currencyFormat(17000, 'USD', 'en-US')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(currencyFormat(18000, 'USD', 'en-US')),
    ).toBeInTheDocument();
  });

  it('labels a quarter payroll started partway through as Partial', () => {
    renderRow(
      jest.fn(),
      managedStaffMember({
        quarterlyHealth: {
          monthlyGrossSalary: 4500,
          completedQuarters: [],
          startingQuarter: { fiscalYear: 2026, quarter: 3, months: [] },
        },
      }),
    );
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('exposes an accessible button with a descriptive label', () => {
    renderRow();
    expect(
      screen.getByRole('button', { name: 'View details for Brooke Butler' }),
    ).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const onClick = renderRow();
    await userEvent.click(
      screen.getByRole('button', { name: 'View details for Brooke Butler' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
