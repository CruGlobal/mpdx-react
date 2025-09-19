import React from 'react';
import { Wallet } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../theme';
import { BalanceCard } from './BalanceCard';

const defaultProps = {
  fundType: 'Primary' as const,
  title: 'Primary Fund',
  icon: Wallet,
  iconBgColor: 'primary.main',
  startingBalance: 1000,
  endingBalance: 1500,
  transfersIn: 500,
  transfersOut: 100,
  isSelected: false,
  onClick: jest.fn(),
};

describe('BalanceCard', () => {
  it('should display "Currently Viewing" in Card Action area when not selected', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} isSelected={true} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('Currently Viewing')).toBeInTheDocument();
  });

  it('should display "View Account" in Card Action area when not selected', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} isSelected={false} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByRole('button', { name: 'View Account' })).toBeInTheDocument();
  });

  it('should call onClick with fundType when CardActionArea is clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} onClick={handleClick} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    userEvent.click(getByRole('button', { name: 'View Account' }));
    expect(handleClick).toHaveBeenCalledWith('Primary');
  });

  it('should format positive balances correctly', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} startingBalance={1234.56} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('Starting Balance: $1,234.56')).toBeInTheDocument();
  });

  it('should format negative balances correctly', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} startingBalance={-500.25} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('Starting Balance: -$500.25')).toBeInTheDocument();
  });

  it('should format zero values correctly', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} transfersIn={0} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('+ Transfers in: $0.00')).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} endingBalance={1000000.99} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('= Ending Balance: $1,000,000.99')).toBeInTheDocument();
  });

  it('should use Math.abs for transfers out display', () => {
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <BalanceCard {...defaultProps} transfersOut={-250.5} />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('- Transfers out: $250.50')).toBeInTheDocument();
  });
});
