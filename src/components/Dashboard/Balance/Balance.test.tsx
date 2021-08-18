import React from 'react';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
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
  it('default', () => {
    const { getByTestId, getByRole } = render(
      <GqlMockedProvider>
        <Balance balance={1000.99} />
      </GqlMockedProvider>,
    );
    expect(getByTestId('BalanceTypography').textContent).toEqual('$1,001');
    expect(getByRole('link', { name: 'View Gifts' })).toHaveAttribute(
      'href',
      'https://stage.mpdx.org/reports/donations',
    );
  });

  it('custom props', () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <Balance balance={1000.99} currencyCode="EUR" />
      </GqlMockedProvider>,
    );
    expect(getByTestId('BalanceTypography').textContent).toEqual('€1,001');
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
});
