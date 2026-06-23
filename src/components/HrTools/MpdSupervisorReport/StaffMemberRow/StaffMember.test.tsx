import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { EmployeeData, QuarterHealthEnum } from '../mockData';
import { StaffMember } from './StaffMember';

const member: EmployeeData = {
  user: {
    id: '1',
    preferredName: 'Brooke',
    lastName: 'Butler',
    personNumber: '10000001',
    staffAccountID: '1000000001',
    userPersonType: 'Full time',
    team: 'FamilyLife',
  },
  quarters: [
    { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ1 26', health: QuarterHealthEnum.Yellow, payroll: 16000 },
    { label: 'FQ2 26', health: QuarterHealthEnum.Red, payroll: 17000 },
    { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 18000 },
  ],
};

const renderRow = (onClick = jest.fn()) => {
  render(
    <ThemeProvider theme={theme}>
      <StaffMember data={member} onClick={onClick} />
    </ThemeProvider>,
  );
  return onClick;
};

describe('StaffMember', () => {
  it('renders the staff member name as "{preferredName} {lastName}"', () => {
    renderRow();
    expect(screen.getByText('Brooke Butler')).toBeInTheDocument();
  });

  it('renders the staff account, employment type, and team line', () => {
    renderRow();
    expect(screen.getByTestId('person-numbers')).toHaveTextContent(
      '1000000001 · Full time · FamilyLife',
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
