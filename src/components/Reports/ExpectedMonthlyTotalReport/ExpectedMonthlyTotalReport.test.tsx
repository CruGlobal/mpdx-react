import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import { GetExpectedMonthlyTotalsQuery } from '../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';
import TestRouter from '__tests__/util/TestRouter';

const title = 'test title';
const onNavListToggle = jest.fn();

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

describe('ExpectedMonthlyTotalReport', () => {
  it('renders with data', async () => {
    const { getAllByTestId, queryByRole, queryAllByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>>
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
        <TestRouter router={router}>
          <GqlMockedProvider<GetExpectedMonthlyTotalsQuery> mocks={mocks}>
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
          <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>
            onCall={mutationSpy}
          >
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
          <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>
            onCall={mutationSpy}
          >
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
});
