import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ReportsStaffExpensesQuery } from '../PartnerGivingAnalysis.generated';
import { BalanceCard } from './BalanceCard';

const mutationSpy = jest.fn();

interface ComponentProps {
  balance?: number;
}

const Components = ({ balance = 15000 }: ComponentProps = {}) => (
  <GqlMockedProvider<{
    ReportsStaffExpenses: ReportsStaffExpensesQuery;
  }>
    mocks={{
      ReportsStaffExpenses: {
        reportsStaffExpenses: {
          funds: [
            {
              fundType: 'Primary',
              balance,
            },
          ],
        },
      },
    }}
    onCall={mutationSpy}
  >
    <BalanceCard />
  </GqlMockedProvider>
);

describe('BalanceCard', () => {
  it('should render loading skeleton while data is loading', () => {
    const { getByTestId } = render(<Components />);
    expect(getByTestId('CardSkeleton')).toBeInTheDocument();
  });

  it('should render the card with all required elements', async () => {
    const { getByText, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
    });

    expect(getByText('Primary Account Balance')).toBeInTheDocument();
    expect(getByText('Current Balance')).toBeInTheDocument();
    expect(getByText('$15,000.00')).toBeInTheDocument();
  });

  it('should make the correct GraphQL query', async () => {
    render(<Components />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ReportsStaffExpenses', {
        fundTypes: ['Primary'],
      }),
    );
  });

  describe('Handle formatting', () => {
    it('should format positive balance amount correctly', async () => {
      const { getByText, queryByTestId } = render(
        <Components balance={1234567.89} />,
      );

      await waitFor(() => {
        expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
      });

      expect(getByText('$1,234,567.89')).toBeInTheDocument();
    });

    it('should handle zero balance amount', async () => {
      const { getByText, queryByTestId } = render(<Components balance={0} />);

      await waitFor(() => {
        expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
      });

      expect(getByText('$0.00')).toBeInTheDocument();
    });

    it('should format negative balance amount', async () => {
      const { getByText, queryByTestId } = render(
        <Components balance={-500} />,
      );

      await waitFor(() => {
        expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
      });

      const balanceElement = getByText('($500.00)');
      expect(balanceElement).toBeInTheDocument();
      expect(balanceElement).toHaveStyle({ color: 'rgb(211, 47, 47)' });
    });
  });
});
