import React from 'react';
import { Wallet } from '@mui/icons-material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('should display "Currently Viewing" in Card Action area when selected', () => {
    const { getByRole, queryByRole } = render(
      <BalanceCard {...defaultProps} isSelected={true} />,
    );
    expect(
      getByRole('button', { name: 'Currently Viewing' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'View Account' }),
    ).not.toBeInTheDocument();
  });

  it('should display "View Account" in Card Action area when not selected', () => {
    const { getByRole, queryByRole } = render(
      <BalanceCard {...defaultProps} isSelected={false} />,
    );
    expect(getByRole('button', { name: 'View Account' })).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Currently Viewing' }),
    ).not.toBeInTheDocument();
  });

  it('should call onClick with fundType when CardActionArea is clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <BalanceCard {...defaultProps} onClick={handleClick} />,
    );
    userEvent.click(getByRole('button', { name: 'View Account' }));
    expect(handleClick).toHaveBeenCalledWith('Primary');
  });

  it('should format positive balances correctly', () => {
    const { getByText } = render(
      <BalanceCard {...defaultProps} startingBalance={1234.56} />,
    );
    expect(getByText('Starting Balance: $1,234.56')).toBeInTheDocument();
  });

  it('should format negative balances correctly', () => {
    const { getByText } = render(
      <BalanceCard {...defaultProps} startingBalance={-500.25} />,
    );
    expect(getByText('Starting Balance: -$500.25')).toBeInTheDocument();
  });

  it('should format zero values correctly', () => {
    const { getByText } = render(
      <BalanceCard {...defaultProps} transfersIn={0} />,
    );
    expect(getByText('+ Transfers in: $0')).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    const { getByText } = render(
      <BalanceCard {...defaultProps} endingBalance={1000000.99} />,
    );
    expect(getByText('= Ending Balance: $1,000,000.99')).toBeInTheDocument();
  });

  it('should use Math.abs for transfers out display', () => {
    const { getByText } = render(
      <BalanceCard {...defaultProps} transfersOut={-250.5} />,
    );
    expect(getByText('- Transfers out: $250.50')).toBeInTheDocument();
  });
});
