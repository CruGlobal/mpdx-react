import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetExpectedMonthlyTotalsQuery } from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import theme from '../../../theme';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

const title = 'test title';
const onNavListToggle = jest.fn();

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const mockedDonations = {
  GetExpectedMonthlyTotals: {
    expectedMonthlyTotalReport: {
      currency: 'CAD',
      received: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
      likely: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
      unlikely: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
    },
  },
};

describe('ExpectedMonthlyTotalReport', () => {
  it('renders with data', async () => {
    const { getAllByTestId, queryByRole, queryAllByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetExpectedMonthlyTotals: GetExpectedMonthlyTotalsQuery;
        }>
          mocks={mockedDonations}
        >
          <ExpectedMonthlyTotalReport
            accountListId={'abc'}
            isNavListOpen={true}
            onNavListToggle={onNavListToggle}
            title={title}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryAllByRole('button')[0]).toBeInTheDocument();

    expect(getAllByTestId('donationColumn')[0]).toBeInTheDocument();
  });

  it('renders empty', async () => {
    const mocks = {
      GetExpectedMonthlyTotals: {
        expectedMonthlyTotalReport: {
          received: {
            donations: [],
          },
          likely: {
            donations: [],
          },
          unlikely: {
            donations: [],
          },
        },
      },
    };

    const { getByText, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              GetExpectedMonthlyTotals: GetExpectedMonthlyTotalsQuery;
            }>
              mocks={mocks}
            >
              <ExpectedMonthlyTotalReport
                accountListId={'abc'}
                isNavListOpen={true}
                onNavListToggle={onNavListToggle}
                title={title}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(
      getByText('You have no expected donations this month'),
    ).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy} mocks={mockedDonations}>
            <ExpectedMonthlyTotalReport
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
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'GetExpectedMonthlyTotals',
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
          <GqlMockedProvider onCall={mutationSpy} mocks={mockedDonations}>
            <ExpectedMonthlyTotalReport
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
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'GetExpectedMonthlyTotals',
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
          <GqlMockedProvider mocks={mockedDonations}>
            <ExpectedMonthlyTotalReport
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
