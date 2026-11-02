import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FundBalancesQuery } from '../../../HrTools/SavingsFundTransfer/ReportsSavingsFund.generated';
import { BalanceCard } from './BalanceCard';

const mutationSpy = jest.fn();

interface ComponentProps {
  endBalance?: number;
  donationPeriodTotalSum?: number;
  mocks?: ApolloErgonoMockMap;
}

const Components = ({
  endBalance = 15000,
  donationPeriodTotalSum,
  mocks,
}: ComponentProps) => (
  <GqlMockedProvider<{
    FundBalances: FundBalancesQuery;
  }>
    mocks={
      mocks ?? {
        FundBalances: {
          reportsStaffExpenses: {
            funds: [
              {
                fundType: 'Primary',
                endBalance,
              },
            ],
          },
        },
      }
    }
    onCall={mutationSpy}
  >
    <BalanceCard donationPeriodTotalSum={donationPeriodTotalSum} />
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
    expect(getByText('$15,000.00')).toBeInTheDocument();
  });

  // Once loading ends the skeleton must not stay up. A user whose staff account SAA does not know
  // still passes the report's staffAccountId check, so the balance query can fail here.
  it('renders nothing when the balance cannot be loaded', async () => {
    const { container, queryByTestId } = render(
      <Components
        mocks={{
          FundBalances: {
            reportsStaffExpenses: () => {
              throw new GraphQLError('Staff account not found');
            },
          },
        }}
      />,
    );

    await waitFor(() =>
      expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument(),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no Primary fund', async () => {
    const { container, queryByTestId } = render(
      <Components
        mocks={{ FundBalances: { reportsStaffExpenses: { funds: [] } } }}
      />,
    );

    await waitFor(() =>
      expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument(),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a donation total of zero', async () => {
    const { findByText, getByText } = render(
      <Components donationPeriodTotalSum={0} />,
    );

    expect(
      await findByText('Total Donations for this period'),
    ).toBeInTheDocument();
    expect(getByText('$0.00')).toBeInTheDocument();
  });

  it('should make the correct GraphQL query', async () => {
    render(<Components />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FundBalances', {
        fundTypes: ['Primary'],
      }),
    );
  });

  describe('Handle formatting', () => {
    it('should format positive balance amount correctly', async () => {
      const { getByText, queryByTestId } = render(
        <Components endBalance={1234567.89} />,
      );

      await waitFor(() => {
        expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
      });

      expect(getByText('$1,234,567.89')).toBeInTheDocument();
    });

    it('should handle zero balance amount', async () => {
      const { getByText, queryByTestId } = render(
        <Components endBalance={0} />,
      );

      await waitFor(() => {
        expect(queryByTestId('CardSkeleton')).not.toBeInTheDocument();
      });

      expect(getByText('$0.00')).toBeInTheDocument();
    });

    it('should format negative balance amount', async () => {
      const { getByText, queryByTestId } = render(
        <Components endBalance={-500} />,
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
