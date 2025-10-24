import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fund } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { BalanceCardList, BalanceCardListProps } from './BalanceCardList';

const onCardClick = jest.fn();
const mockFunds: Fund[] = [
  {
    id: '1',
    fundType: 'Primary',
    balance: 1500,
    total: 600,
    deficitLimit: 0,
  },
  {
    id: '2',
    fundType: 'Savings',
    balance: 2000,
    total: 300,
    deficitLimit: 0,
  },
  {
    id: '3',
    fundType: 'ConferenceSavings',
    balance: -500,
    total: -200,
    deficitLimit: -1000,
  },
];

const defaultProps = {
  funds: mockFunds,
  selectedFundType: null,
  startingBalance: 1000,
  endingBalance: 1500,
  transferTotals: {
    Primary: { in: 500, out: 100 },
    Savings: { in: 300, out: 50 },
    ConferenceSavings: { in: 0, out: 200 },
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
    expect(onCardClick).toHaveBeenCalledWith('Primary');
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

  it('displays values for each card', () => {
    const { getByText, getAllByText } = render(
      <TestComponent {...defaultProps} />,
    );
    expect(getByText('+ Transfers in: $500')).toBeInTheDocument();
    expect(getByText('- Transfers out: $100')).toBeInTheDocument();
    expect(getByText('+ Transfers in: $300')).toBeInTheDocument();
    expect(getByText('- Transfers out: $50')).toBeInTheDocument();
    expect(getByText('+ Transfers in: $0')).toBeInTheDocument();
    expect(getByText('- Transfers out: $200')).toBeInTheDocument();
    expect(getAllByText('Starting Balance: $1,000')).toHaveLength(3);
    expect(getAllByText('= Ending Balance: $1,500')).toHaveLength(3);
  });

  it('renders empty when no funds provided', () => {
    const { queryByRole } = render(
      <TestComponent {...defaultProps} funds={[]} />,
    );
    expect(queryByRole('button')).not.toBeInTheDocument();
  });
});
