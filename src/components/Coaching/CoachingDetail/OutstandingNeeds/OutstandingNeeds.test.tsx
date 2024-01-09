import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountListTypeEnum } from '../CoachingDetail';
import { OutstandingNeeds } from './OutstandingNeeds';
import {
  LoadAccountListCoachingNeedsQuery,
  LoadCoachingNeedsQuery,
} from './OutstandingNeeds.generated';

const accountListId = 'account-list-1';

describe('OutstandingNeeds', () => {
  it('renders skeleton while loading initial account data', () => {
    const { getAllByTestId } = render(
      <GqlMockedProvider<{
        LoadAccountListCoachingNeeds: LoadAccountListCoachingNeedsQuery;
      }>
        mocks={{
          LoadAccountListCoachingNeeds: {
            accountList: {
              id: accountListId,
              primaryAppeal: {
                pledges: {
                  nodes: [
                    {
                      amountCurrency: 'USD',
                    },
                  ],
                },
              },
            },
          },
        }}
      >
        <OutstandingNeeds
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Own}
        />
      </GqlMockedProvider>,
    );

    expect(getAllByTestId('Line')).toHaveLength(8);
  });

  it('renders outstanding needs correctly', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadAccountListCoachingNeeds: LoadAccountListCoachingNeedsQuery;
      }>
        mocks={{
          LoadAccountListCoachingNeeds: {
            accountList: {
              id: accountListId,
              primaryAppeal: {
                pledges: {
                  nodes: [
                    {
                      amount: 32.29,
                      amountCurrency: 'USD',
                      expectedDate: '2022-02-15',
                      contact: {
                        name: 'Dennis Reynolds',
                      },
                    },
                  ],
                },
              },
            },
          },
        }}
      >
        <OutstandingNeeds
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Own}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    expect(await findByText('Dennis Reynolds')).toBeInTheDocument();
    expect(await findByText('$32')).toBeInTheDocument();
    expect(await findByText('2/15/2022')).toBeInTheDocument();
  });

  it('renders outstanding needs with missing data', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadCoachingNeeds: LoadCoachingNeedsQuery;
      }>
        mocks={{
          LoadCoachingNeeds: {
            coachingAccountList: {
              id: accountListId,
              primaryAppeal: {
                pledges: {
                  nodes: [
                    {
                      amount: 0,
                      amountCurrency: null,
                      expectedDate: '',
                      contact: {
                        name: 'Charlie Kelly',
                      },
                    },
                  ],
                },
              },
            },
          },
        }}
      >
        <OutstandingNeeds
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Coaching}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    expect(await findByText('Charlie Kelly')).toBeInTheDocument();
    expect(await findByText('N/A')).toBeInTheDocument();
    expect(await findByText('Start Date Not Set')).toBeInTheDocument();
  });
});
