import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { DonationsGraph } from './DonationsGraph';
import {
  GetDonationsGraphQuery,
  useGetDonationsGraphQuery,
} from './DonationsGraph.generated';

// ResponsiveContainer isn't rendering its children in tests, so override it to render its children with static dimensions
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }) => ({
    ...children,
    props: {
      ...children.props,
      height: 600,
      width: 300,
    },
  }),
}));

const accountListId = 'account-list-id';
const donorAccountIds = ['donor-Account-Id'];
const currency = 'USD';

describe('Donations Graph', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('test renderer', async () => {
    const { findByText } = render(
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
    expect(await findByText('Amount (USD)')).toBeInTheDocument();
  });

  it('renders loading placeholders while loading data', () => {
    const { getByLabelText } = render(
      <GqlMockedProvider>
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={['donorAccountId']}
          convertedCurrency="USD"
        />
      </GqlMockedProvider>,
    );
    expect(getByLabelText('Loading donations graph')).toBeInTheDocument();
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
