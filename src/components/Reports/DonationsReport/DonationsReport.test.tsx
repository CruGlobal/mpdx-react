import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { DonationTableQuery } from 'src/components/DonationTable/DonationTable.generated';
import theme from 'src/theme';
import { GetDonationsGraphQuery } from '../../Contacts/ContactDetails/ContactDonationsTab/DonationsGraph/DonationsGraph.generated';
import { DonationsReport } from './DonationsReport';

const title = 'test title';
const onNavListToggle = jest.fn();

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const mocks = {
  GetDonationGraph: {
    accountList: {
      currency: 'CAD',
      monthlyGoal: 100,
      totalPledges: 10,
    },
    reportsDonationHistories: {
      averageIgnoreCurrent: 10,
      periods: [
        {
          startDate: DateTime.now().minus({ months: 12 }).toISO(),
          convertedTotal: 10,
          totals: [
            {
              currency: 'CAD',
              convertedAmount: 10,
            },
          ],
        },
        {
          startDate: DateTime.now().minus({ months: 11 }).toISO(),
          convertedTotal: 10,
          totals: [
            {
              currency: 'CAD',
              convertedAmount: 10,
            },
          ],
        },
      ],
    },
  },
  DonationTable: {
    donations: {
      nodes: [
        {
          amount: {
            convertedCurrency: 'CAD',
            currency: 'CAD',
          },
          donorAccount: {
            displayName: 'John',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
};
interface Mocks {
  GetDonationsGraph: GetDonationsGraphQuery;
  DonationTable: DonationTableQuery;
}

describe('DonationsReport', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders empty', async () => {
    const {
      getByTestId,
      getByText,
      queryByRole,
      queryAllByRole,
      queryByTestId,
    } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks>
            mocks={{
              ...mocks,
              GetDonationGraph: {
                ...mocks.GetDonationGraph,
                reportsDonationHistories: {
                  ...mocks.GetDonationGraph.reportsDonationHistories,
                  periods: [],
                },
              },
            }}
          >
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(
      queryByTestId('DonationHistoriesGridLoading'),
    ).not.toBeInTheDocument();
    expect(queryAllByRole('button')[1]).toBeInTheDocument();
  });

  it('renders with data', async () => {
    const { getByTestId, findByRole, queryByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks> mocks={mocks}>
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(
      getByTestId('DonationHistoriesTypographyAverage'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('DonationHistoriesGridLoading'),
    ).not.toBeInTheDocument();
    expect(await findByRole('cell', { name: 'John' })).toBeInTheDocument();
  });

  it('initializes with month from query', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            ...router,
            query: { ...router.query, month: '2024-02-01' },
          }}
        >
          <GqlMockedProvider<Mocks> mocks={mocks}>
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: 'February 2024' })).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks> mocks={mocks} onCall={mutationSpy}>
            <DonationsReport
              accountListId={'abc'}
              designationAccounts={['account-1']}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[2][0]).toMatchObject({
        operation: {
          operationName: 'GetDonationGraph',
          variables: {
            designationAccountIds: ['account-1'],
          },
        },
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks> mocks={mocks} onCall={mutationSpy}>
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[2][0]).toMatchObject({
        operation: {
          operationName: 'GetDonationGraph',
          variables: {
            designationAccountIds: null,
          },
        },
      }),
    );
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks> mocks={mocks}>
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              title={title}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });
});
