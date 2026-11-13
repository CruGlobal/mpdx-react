import React from 'react';
import { within } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { DateTime } from 'luxon';
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

// The graph box is about 340px wide on a 360-390px phone
const phoneBoxWidth = 340;
const boxHeight = 284;

// jsdom has no layout, so every element is 0px and ResponsiveContainer would
// draw nothing. Give the chart wrapper the size a browser would: the width of
// its box, or its min-width when that is wider.
const mockPhoneBoxSize = () => {
  jest
    .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
    .mockImplementation(function (this: HTMLElement) {
      if (!this.classList.contains('recharts-responsive-container')) {
        return 0;
      }
      return Math.max(phoneBoxWidth, parseFloat(this.style.minWidth) || 0);
    });
  jest
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('recharts-responsive-container')
        ? boxHeight
        : 0;
    });
};

// One period per month for the last 24 months
const periods = Array.from({ length: 24 }, (_, index) => ({
  startDate: DateTime.now()
    .startOf('month')
    .minus({ months: 23 - index })
    .toISODate(),
  convertedTotal: 100 + index * 10,
}));

const renderPhoneGraph = () =>
  render(
    <GqlMockedProvider<{ GetDonationsGraph: GetDonationsGraphQuery }>
      mocks={{
        GetDonationsGraph: {
          accountList: {
            currency: 'USD',
          },
          reportsDonationHistories: {
            periods,
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

const findChartWrapper = async (container: HTMLElement) => {
  await within(container).findByText('Amount (USD)');
  const wrapper = container.querySelector<HTMLElement>(
    '.recharts-responsive-container',
  );
  if (!wrapper) {
    throw new Error('Chart wrapper not found');
  }
  return wrapper;
};

const accountListId = 'account-list-id';
const donorAccountIds = ['donor-Account-Id'];
const currency = 'USD';

describe('Donations Graph', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
    mockPhoneBoxSize();
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

  it('renders loading placeholders while waiting for donorAccountIds', async () => {
    const { getByLabelText } = render(
      <GqlMockedProvider>
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={undefined}
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
            accountListId,
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

  describe('on a phone', () => {
    it('draws the chart no wider than its box', async () => {
      const { container } = renderPhoneGraph();
      const wrapper = await findChartWrapper(container);

      const chart = wrapper.querySelector<HTMLElement>('.recharts-wrapper');
      expect(parseFloat(chart?.style.width ?? '')).toBeLessThanOrEqual(
        phoneBoxWidth,
      );
    });

    it('does not make the graph box scroll sideways', async () => {
      const { container } = renderPhoneGraph();
      const wrapper = await findChartWrapper(container);

      expect(wrapper.parentElement).not.toHaveStyle({ overflowX: 'scroll' });
    });

    it('keeps the whole legend inside the box', async () => {
      const { container } = renderPhoneGraph();
      const wrapper = await findChartWrapper(container);

      const legend = wrapper.querySelector<HTMLElement>(
        '.recharts-legend-wrapper',
      );
      if (!legend) {
        throw new Error('Legend not found');
      }
      expect(
        within(legend).getByText('Previous 13 - 24 months'),
      ).toBeInTheDocument();
      expect(
        within(legend).getByText('Previous 12 months'),
      ).toBeInTheDocument();
      const legendRightEdge =
        parseFloat(legend.style.left || '0') + parseFloat(legend.style.width);
      expect(legendRightEdge).toBeLessThanOrEqual(phoneBoxWidth);
    });
  });
});
