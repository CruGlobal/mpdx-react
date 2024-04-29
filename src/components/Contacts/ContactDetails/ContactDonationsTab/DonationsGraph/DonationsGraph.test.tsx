import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { DonationsGraph } from './DonationsGraph';
import {
  GetDonationsGraphDocument,
  GetDonationsGraphQuery,
  useGetDonationsGraphQuery,
} from './DonationsGraph.generated';

const accountListId = 'account-list-id';
const donorAccountIds = ['donor-Account-Id'];
const currency = 'USD';
describe('Donations Graph', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<{ GetDonationsGraph: GetDonationsGraphQuery }>
        mocks={{
          GetDonationsGraph: {
            accountList: {
              currency: 'USD',
            },
            reportsDonationHistories: {
              periods: [
                {
                  totals: [
                    {
                      currency: 'USD',
                    },
                  ],
                },
              ],
            },
          },
        }}
      >
        <DonationsGraph
          accountListId={accountListId}
          donorAccountIds={donorAccountIds}
          convertedCurrency={currency}
        />
      </GqlMockedProvider>,
    );
    expect(await findByRole('textbox')).toBeVisible();
  });

  it('test loading renderer', async () => {
    const { findByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetDonationsGraphDocument,
              variables: {
                accountListId: accountListId,
                donorAccountIds: donorAccountIds,
                convertCurrency: currency,
              },
            },
            result: {},
            delay: 8640000000,
          },
        ]}
      >
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={['donorAccountId']}
          convertedCurrency="USD"
        />
      </MockedProvider>,
    );
    expect(await findByRole('alert')).toBeVisible();
  });

  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetDonationsGraphQuery({
          variables: {
            accountListId: accountListId,
            donorAccountIds: donorAccountIds,
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "account-list-id",
        "donorAccountIds": Array [
          "donor-Account-Id",
        ],
      }
    `);
  });

  it('renders gift averages', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<{ GetDonationsGraph: GetDonationsGraphQuery }>
        mocks={{
          GetDonationsGraph: {
            accountList: {
              currency: 'CAD',
            },
            reportsDonationHistories: {
              averageIgnoreCurrent: 100,
              averageIgnoreCurrentAndZero: 200,
              periods: [],
            },
          },
        }}
      >
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={['donorAccountId']}
          convertedCurrency="USD"
        />
      </GqlMockedProvider>,
    );

    expect(
      await findByRole('heading', {
        name: 'Average: CA$100 | Gift Average: CA$200',
      }),
    ).toBeInTheDocument();
  });
});
