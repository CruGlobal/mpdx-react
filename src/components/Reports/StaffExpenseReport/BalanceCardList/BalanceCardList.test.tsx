import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fund } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { BalanceCardList, BalanceCardListProps } from './BalanceCardList';

const onCardClick = jest.fn();
const mockFunds: Fund[] = [
  {
    id: '1',
    fundType: 'Primary',
    startBalance: 1000,
    endBalance: 1400,
    total: 600,
    deficitLimit: 0,
  },
  {
    id: '2',
    fundType: 'Savings',
    startBalance: 2000,
    endBalance: 2250,
    total: 300,
    deficitLimit: 0,
  },
  {
    id: '3',
    fundType: 'ConferenceSavings',
    startBalance: 500,
    endBalance: 300,
    total: -200,
    deficitLimit: -1000,
  },
];

const defaultProps = {
  funds: mockFunds,
  selectedFundType: 'Primary',
  // Expenses are summed from negative-amount transactions, so `out` is negative.
  transferTotals: {
    Primary: { in: 500, out: -100 },
    Savings: { in: 300, out: -50 },
    ConferenceSavings: { in: 0, out: -200 },
  },
  onCardClick: onCardClick,
  loading: false,
};

const TestComponent: React.FC<BalanceCardListProps> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <BalanceCardList {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('BalanceCardList', () => {
  it('renders a card for each fund', () => {
    const { getAllByRole } = render(<TestComponent {...defaultProps} />);
    expect(getAllByRole('button')).toHaveLength(3);
  });

  it('renders skeleton loaders when loading', () => {
    const { queryByRole, queryByText } = render(
      <TestComponent {...defaultProps} loading={true} />,
    );
    expect(queryByRole('button')).not.toBeInTheDocument();
    expect(queryByText('Primary')).not.toBeInTheDocument();
  });

  it('calls onCardClick with correct fundType when card is clicked', () => {
    const { getAllByRole } = render(<TestComponent {...defaultProps} />);

    userEvent.click(getAllByRole('button', { name: 'View Account' })[0]);
    expect(onCardClick).toHaveBeenCalledWith('Savings');
  });

  it('displays selected state on correct card', () => {
    const { getByRole, getAllByRole } = render(
      <TestComponent {...defaultProps} selectedFundType="Savings" />,
    );
    expect(
      getByRole('button', { name: 'Currently Viewing' }),
    ).toBeInTheDocument();

    expect(getAllByRole('button', { name: 'View Account' })).toHaveLength(2);
  });

  it('displays values for the selected card', async () => {
    const { getByText, findByText } = render(
      <TestComponent {...defaultProps} />,
    );

    const income = await findByText('Income:');
    expect(within(income).getByText('$500.00')).toBeInTheDocument();
    const expenses = getByText('Expenses:');
    expect(within(expenses).getByText('$100.00')).toBeInTheDocument();
    expect(getByText('Starting Balance: $1,000.00')).toBeInTheDocument();
    expect(getByText('= Ending Balance: $1,400.00')).toBeInTheDocument();
  });

  it('renders empty when no funds provided', () => {
    const { queryByRole } = render(
      <TestComponent {...defaultProps} funds={[]} />,
    );
    expect(queryByRole('button')).not.toBeInTheDocument();
  });
});
