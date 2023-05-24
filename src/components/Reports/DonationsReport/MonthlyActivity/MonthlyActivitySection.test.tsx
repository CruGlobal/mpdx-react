import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import theme from '../../../../theme';
import { GetDonationGraphQuery } from '../GetDonationGraph.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { MonthlyActivitySection } from './MonthlyActivitySection';
import TestRouter from '__tests__/util/TestRouter';
import {
  beforeTestResizeObserver,
  afterTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';

const setTime = jest.fn();

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
};

describe('Render Monthly Activity Section', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders with data', async () => {
    const { getByTestId, queryByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ GetDonationGraph: GetDonationGraphQuery }>
            mocks={mocks}
          >
            <MonthlyActivitySection accountListId={'abc'} setTime={setTime} />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(queryByRole('progressbar')).not.toBeInTheDocument();
      expect(
        getByTestId('DonationHistoriesTypographyAverage'),
      ).toBeInTheDocument();
    });
    expect(
      queryByTestId('DonationHistoriesGridLoading'),
    ).not.toBeInTheDocument();
  });

  it('renders empty', async () => {
    const mocks = {
      GetDonationGraph: {
        accountList: {
          currency: 'CAD',
          monthlyGoal: 0,
          totalPledges: 0,
        },
        reportsDonationHistories: {
          averageIgnoreCurrent: 0,
          periods: [
            {
              startDate: DateTime.now().minus({ months: 12 }).toISO(),
              convertedTotal: 0,
              totals: [
                {
                  currency: 'CAD',
                  convertedAmount: 0,
                },
              ],
            },
            {
              startDate: DateTime.now().minus({ months: 11 }).toISO(),
              convertedTotal: 0,
              totals: [
                {
                  currency: 'CAD',
                  convertedAmount: 0,
                },
              ],
            },
          ],
        },
      },
    };

    const { queryByText, queryByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ GetDonationGraph: GetDonationGraphQuery }>
            mocks={mocks}
          >
            <MonthlyActivitySection
              accountListId={'abc'}
              designationAccounts={[]}
              setTime={setTime}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByText('Average')).not.toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <MonthlyActivitySection
              accountListId={'abc'}
              designationAccounts={['account-1']}
              setTime={setTime}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
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
          <GqlMockedProvider<{ GetDonationGraph: GetDonationGraphQuery }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <MonthlyActivitySection accountListId={'abc'} setTime={setTime} />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
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
