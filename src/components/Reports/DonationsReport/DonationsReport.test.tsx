import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import theme from '../../../theme';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { DonationsReport } from './DonationsReport';
import TestRouter from '__tests__/util/TestRouter';
import {
  beforeTestResizeObserver,
  afterTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';
import { GetDonationsGraphQuery } from '../../Contacts/ContactDetails/ContactDontationsTab/DonationsGraph/DonationsGraph.generated';
import { GetDonationsTableQuery } from './GetDonationsTable.generated';

const title = 'test title';
const onNavListToggle = jest.fn();
const onSelectContact = jest.fn();

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
  GetDonationsTable: {
    donations: {
      nodes: [
        {
          amount: {
            amount: 10,
            convertedAmount: 10,
            convertedCurrency: 'CAD',
            currency: 'CAD',
          },
          appeal: {
            id: 'abc',
            name: 'John',
          },
          donationDate: DateTime.now().minus({ minutes: 4 }).toISO(),
          donorAccount: {
            displayName: 'John',
            id: 'abc',
          },
          id: 'abc',
          paymentMethod: 'pay',
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
  GetDonationsTable: GetDonationsTableQuery;
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
              onSelectContact={onSelectContact}
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
    const { getByTestId, queryByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks> mocks={mocks}>
            <DonationsReport
              accountListId={'abc'}
              isNavListOpen={true}
              onNavListToggle={onNavListToggle}
              onSelectContact={onSelectContact}
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
    expect(getByTestId('donationRow')).toBeInTheDocument();
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
              onSelectContact={onSelectContact}
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
              onSelectContact={onSelectContact}
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
});
