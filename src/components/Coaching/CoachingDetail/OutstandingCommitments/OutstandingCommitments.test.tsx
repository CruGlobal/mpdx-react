import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountListTypeEnum } from '../CoachingDetail';
import { OutstandingCommitments } from './OutstandingCommitments';
import {
  LoadAccountListCoachingCommitmentsQuery,
  LoadCoachingCommitmentsQuery,
} from './OutstandingCommitments.generated';

const accountListId = 'account-list-1';

describe('OutstandingCommitments', () => {
  it('renders skeleton while loading initial account data', () => {
    const { getAllByTestId } = render(
      <GqlMockedProvider<{
        LoadAccountListCoachingCommitments: LoadAccountListCoachingCommitmentsQuery;
      }>
        mocks={{
          LoadAccountListCoachingCommitments: {
            accountList: {
              id: accountListId,
              contacts: {
                nodes: [
                  {
                    pledgeCurrency: 'USD',
                  },
                ],
              },
            },
          },
        }}
      >
        <OutstandingCommitments
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Own}
        />
      </GqlMockedProvider>,
    );

    expect(getAllByTestId('MultilineSkeletonLine')).toHaveLength(8);
  });

  it('Renders overdue years in own outstanding recurring commitments correctly', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadAccountListCoachingCommitments: LoadAccountListCoachingCommitmentsQuery;
      }>
        mocks={{
          LoadAccountListCoachingCommitments: {
            accountList: {
              id: accountListId,
              contacts: {
                nodes: [
                  {
                    pledgeCurrency: 'USD',
                    pledgeStartDate: '2000-10-31',
                    pledgeAmount: 100,
                    name: 'Mac McDonald',
                  },
                ],
              },
            },
          },
        }}
      >
        <OutstandingCommitments
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Own}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Frequency')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    expect(await findByText('Mac McDonald')).toBeInTheDocument();
    expect(await findByText('$100')).toBeInTheDocument();
    expect(await findByText('10/31/2000 (19 years ago)')).toBeInTheDocument();
  });

  it('Renders overdue months in coaching outstanding recurring commitments correctly', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadCoachingCommitments: LoadCoachingCommitmentsQuery;
      }>
        mocks={{
          LoadCoachingCommitments: {
            coachingAccountList: {
              id: accountListId,
              contacts: {
                nodes: [
                  {
                    pledgeCurrency: 'USD',
                    pledgeStartDate: '2019-08-04',
                    pledgeAmount: 12.43,
                    name: 'Country Mac',
                  },
                ],
              },
            },
          },
        }}
      >
        <OutstandingCommitments
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Coaching}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Frequency')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    expect(await findByText('Country Mac')).toBeInTheDocument();
    expect(await findByText('$12.43')).toBeInTheDocument();
    expect(await findByText('8/4/2019 (5 months ago)')).toBeInTheDocument();
  });

  it('renders outstanding recurring coaching commitments with missing data correctly', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadCoachingCommitments: LoadCoachingCommitmentsQuery;
      }>
        mocks={{
          LoadCoachingCommitments: {
            coachingAccountList: {
              id: accountListId,
              contacts: {
                nodes: [
                  {
                    pledgeCurrency: 'CAD',
                    pledgeStartDate: '',
                    pledgeAmount: 0,
                    name: 'Frank Reynolds',
                  },
                ],
              },
            },
          },
        }}
      >
        <OutstandingCommitments
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Coaching}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Frequency')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    expect(await findByText('Frank Reynolds')).toBeInTheDocument();
    expect(await findByText('N/A')).toBeInTheDocument();
  });

  it('renders more outstanding recurring coaching commitments on fetchMore', async () => {
    const { findByText, getByRole, getAllByRole } = render(
      <GqlMockedProvider<{
        LoadCoachingCommitments: LoadCoachingCommitmentsQuery;
      }>
        mocks={{
          LoadCoachingCommitments: {
            coachingAccountList: {
              id: accountListId,
              contacts: {
                nodes: [...Array(15)].map((x, i) => {
                  return {
                    pledgeStartDate: DateTime.local()
                      .minus({ month: i })
                      .toISO()
                      .toString(),
                    pledgeCurrency: 'USD',
                    pledgeAmount: 10,
                  };
                }),
                pageInfo: {
                  hasNextPage: true,
                },
              },
            },
          },
        }}
      >
        <OutstandingCommitments
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Coaching}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Name')).toBeInTheDocument();
    expect(await findByText('Amount')).toBeInTheDocument();
    expect(await findByText('Frequency')).toBeInTheDocument();
    expect(await findByText('Expected Date')).toBeInTheDocument();

    userEvent.click(getByRole('button'));
    expect(getAllByRole('row')).toHaveLength(16);
  });
});
