import React from 'react';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import Appeals from '.';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('Appeals', () => {
  it('default', () => {
    const { getByTestId } = render(<Appeals />);
    expect(getByTestId('AppealsCardContentEmpty')).toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, getByRole } = render(
      <GqlMockedProvider>
        <Appeals loading />
      </GqlMockedProvider>,
    );

    expect(getByTestId('AppealsBoxName').children[0].className).toContain(
      'MuiSkeleton-root',
    );
    expect(getByTestId('AppealsBoxAmount').children[0].className).toContain(
      'MuiSkeleton-root',
    );
    expect(
      getByTestId('AppealsTypographyPledgesAmountProcessedPercentage')
        .children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('AppealsTypographyPledgesAmountProcessed').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('AppealsTypographyPledgesAmountTotalPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('AppealsTypographyPledgesAmountTotal').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByRole('link', { hidden: true, name: 'View All' }),
    ).toHaveAttribute(
      'href',
      `https://${process.env.REWRITE_DOMAIN}/tools/appeals`,
    );
  });

  it('props', () => {
    const appeal = {
      id: 'appealId',
      name: 'My Appeal',
      amount: 4999.99,
      pledgesAmountTotal: 2499.99,
      pledgesAmountProcessed: 999.99,
      amountCurrency: 'EUR',
    };
    const { getByTestId } = render(
      <GqlMockedProvider>
        <Appeals appeal={appeal} />
      </GqlMockedProvider>,
    );

    expect(getByTestId('AppealsBoxName').textContent).toEqual('My Appeal');
    expect(getByTestId('AppealsBoxAmount').textContent).toEqual('€4,999.99');
    expect(
      getByTestId('AppealsTypographyPledgesAmountProcessedPercentage')
        .textContent,
    ).toEqual('20%');
    expect(
      getByTestId('AppealsTypographyPledgesAmountProcessed').textContent,
    ).toEqual('€999.99');
    expect(
      getByTestId('AppealsTypographyPledgesAmountTotalPercentage').textContent,
    ).toEqual('50%');
    expect(
      getByTestId('AppealsTypographyPledgesAmountTotal').textContent,
    ).toEqual('€2,499.99');
  });
});
