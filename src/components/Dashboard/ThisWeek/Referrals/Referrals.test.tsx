import React from 'react';
import {
  render,
  fireEvent,
} from '../../../../../__tests__/util/testingLibraryReactMock';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import Referrals from '.';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('Referrals', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <Referrals loading={false} />,
    );
    expect(getByTestId('ReferralsDivRecent')).toBeInTheDocument();
    expect(queryByTestId('ReferralsDivOnHand')).not.toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecent').textContent).toEqual('Recent (0)');
    const OnHandTab = getByTestId('ReferralsTabOnHand');
    expect(OnHandTab.textContent).toEqual('On Hand (0)');
    fireEvent.click(OnHandTab);
    expect(queryByTestId('ReferralsDivRecent')).not.toBeInTheDocument();
    expect(getByTestId('ReferralsDivOnHand')).toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(<Referrals loading />);
    expect(getByTestId('ReferralsTabRecentListLoading')).toBeInTheDocument();
    expect(
      queryByTestId('ReferralsTabOnHandListLoading'),
    ).not.toBeInTheDocument();
    fireEvent.click(getByTestId('ReferralsTabOnHand'));
    expect(getByTestId('ReferralsTabOnHandListLoading')).toBeInTheDocument();
    expect(
      queryByTestId('ReferralsTabRecentListLoading'),
    ).not.toBeInTheDocument();
  });

  it('empty', () => {
    const referrals = {
      nodes: [],
      totalCount: 0,
    };
    const { getByTestId, queryByTestId } = render(
      <Referrals
        loading={false}
        recentReferrals={referrals}
        onHandReferrals={referrals}
      />,
    );
    expect(
      getByTestId('ReferralsTabRecentCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('ReferralsTabOnHandCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecent').textContent).toEqual('Recent (0)');
    const OnHandTab = getByTestId('ReferralsTabOnHand');
    expect(OnHandTab.textContent).toEqual('On Hand (0)');
    fireEvent.click(OnHandTab);
    expect(
      getByTestId('ReferralsTabOnHandCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('ReferralsTabRecentCardContentEmpty'),
    ).not.toBeInTheDocument();
  });

  it('props', () => {
    const recentReferrals = {
      nodes: [
        {
          id: 'contact_1',
          name: 'Smith, Bob',
        },
        {
          id: 'contact_2',
          name: 'Smith, Sarah',
        },
      ],
      totalCount: 1234,
    };
    const onHandReferrals = {
      nodes: [
        {
          id: 'contact_3',
          name: 'Smith, Mike',
        },
        {
          id: 'contact_4',
          name: 'Smith, Shelley',
        },
      ],
      totalCount: 5678,
    };
    const { getByTestId, queryByTestId } = render(
      <GqlMockedProvider>
        <Referrals
          loading={false}
          recentReferrals={recentReferrals}
          onHandReferrals={onHandReferrals}
        />
      </GqlMockedProvider>,
    );
    expect(
      queryByTestId('ReferralsTabRecentCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecentList')).toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecent').textContent).toEqual(
      'Recent (1,234)',
    );
    const referralElement1 = getByTestId(
      'ReferralsTabRecentListItem-contact_1',
    );
    expect(referralElement1.textContent).toEqual('Smith, Bob');

    const referralElement2 = getByTestId(
      'ReferralsTabRecentListItem-contact_2',
    );
    expect(referralElement2.textContent).toEqual('Smith, Sarah');

    const OnHandTab = getByTestId('ReferralsTabOnHand');
    expect(OnHandTab.textContent).toEqual('On Hand (5,678)');
    fireEvent.click(OnHandTab);
    expect(
      queryByTestId('ReferralsTabOnHandCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('ReferralsTabOnHandList')).toBeInTheDocument();
    const referralElement3 = getByTestId(
      'ReferralsTabOnHandListItem-contact_3',
    );
    expect(referralElement3.textContent).toEqual('Smith, Mike');

    const referralElement4 = getByTestId(
      'ReferralsTabOnHandListItem-contact_4',
    );
    expect(referralElement4.textContent).toEqual('Smith, Shelley');
  });
});
