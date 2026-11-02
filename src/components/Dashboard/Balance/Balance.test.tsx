import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import { createCache } from 'src/lib/apollo/cache';
import Balance from '.';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('Balance', () => {
  const supportedStaff = {
    GetUser: {
      user: {
        usStaffGroup: UsStaffGroupEnum.SeniorStaff,
        spouseUsStaffGroup: null,
      },
    },
  };

  it('default', async () => {
    const { findByText, getByRole } = render(
      <GqlMockedProvider<{ GetUser: GetUserQuery }> mocks={supportedStaff}>
        <Balance balance={1000.99} />
      </GqlMockedProvider>,
    );
    expect(await findByText('$1,000.99')).toBeInTheDocument();
    expect(getByRole('link', { name: 'View Gifts' })).toHaveAttribute(
      'href',
      '/accountLists/abc/reports/donations',
    );
  });

  it('custom props', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{ GetUser: GetUserQuery }> mocks={supportedStaff}>
        <Balance balance={1000.99} currencyCode="EUR" />
      </GqlMockedProvider>,
    );
    expect(await findByText('€1,000.99')).toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <Balance loading={true} />
      </GqlMockedProvider>,
    );
    expect(getByTestId('BalanceTypography').children[0].className).toContain(
      'MuiSkeleton-root',
    );
  });

  it('keeps showing the balance while a cached user refetches', async () => {
    // The app's default watchQuery options refetch on every mount and report
    // loading while they do, even when the user is already cached
    const defaultOptions = {
      watchQuery: {
        fetchPolicy: 'cache-and-network' as const,
        notifyOnNetworkStatusChange: true,
      },
    };
    const cache = createCache();
    const { findByText, getAllByTestId, rerender } = render(
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={supportedStaff}
        defaultOptions={defaultOptions}
        cache={cache}
      >
        <Balance balance={1000.99} />
      </GqlMockedProvider>,
    );
    expect(await findByText('$1,000.99')).toBeInTheDocument();

    rerender(
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={supportedStaff}
        defaultOptions={defaultOptions}
        cache={cache}
      >
        <>
          <Balance balance={1000.99} />
          <Balance balance={1000.99} />
        </>
      </GqlMockedProvider>,
    );

    expect(
      getAllByTestId('BalanceTypography').map((node) => node.textContent),
    ).toEqual(['$1,000.99', '$1,000.99']);
  });

  describe('paid with designation staff', () => {
    const renderBalance = (spouseUsStaffGroup: UsStaffGroupEnum | null) =>
      render(
        <GqlMockedProvider<{ GetUser: GetUserQuery }>
          mocks={{
            GetUser: {
              user: {
                usStaffGroup: UsStaffGroupEnum.PaidWithDesignation,
                spouseUsStaffGroup,
              },
            },
          }}
        >
          <Balance balance={1000.99} />
        </GqlMockedProvider>,
      );

    it('explains there is no balance instead of showing one', async () => {
      const { findByText, queryByText, getByRole } = renderBalance(null);

      expect(
        await findByText(
          'Your designation is not connected to a staff account, so there is no account balance to show.',
        ),
      ).toBeInTheDocument();
      expect(queryByText('$1,000.99')).not.toBeInTheDocument();
      expect(getByRole('link', { name: 'View Gifts' })).toBeInTheDocument();
    });

    it('shows no amount before the user loads', () => {
      const { getByTestId, queryByText } = renderBalance(null);

      expect(getByTestId('BalanceTypography').children[0].className).toContain(
        'MuiSkeleton-root',
      );
      expect(queryByText('$1,000.99')).not.toBeInTheDocument();
    });

    it('shows the balance when the spouse is supported staff', async () => {
      const { getByTestId, queryByText } = renderBalance(
        UsStaffGroupEnum.SeniorStaff,
      );

      await waitFor(() =>
        expect(getByTestId('BalanceTypography').textContent).toEqual(
          '$1,000.99',
        ),
      );
      expect(
        queryByText(/not connected to a staff account/),
      ).not.toBeInTheDocument();
    });
  });
});
