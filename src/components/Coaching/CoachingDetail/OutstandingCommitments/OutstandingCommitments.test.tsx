import { render } from '@testing-library/react';
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

    expect(getAllByTestId('Line')).toHaveLength(8);
  });

  it('Renders outstanding recurring own commitments correctly', async () => {
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
});
