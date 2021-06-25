import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SalaryReportTable } from './SalaryReportTable';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FourteenMonthReportQuery } from 'pages/accountLists/[accountListId]/reports/graphql/GetReportFourteenMonth.generated';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';

//TODO: Need test coverage for error state

describe('SalaryReportTable', () => {
  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery>>
          <SalaryReportTable accountListId={accountListId} title={title} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText('test title')).toBeInTheDocument();
    expect(queryByTestId('LoadingSalaryReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('salary report loaded', async () => {
    const mocks = {
      data: {
        fourteenMonthReport: {
          currencyGroups: [
            {
              contacts: [
                {
                  id: 'contact-1',
                  months: [
                    {
                      month: '2020-10-01',
                      total: 35,
                    },
                    {
                      month: '2020-11-01',
                      total: 35,
                    },
                    {
                      month: '2020-12-01',
                      total: 35,
                    },
                    {
                      month: '2021-1-01',
                      total: 35,
                    },
                  ],
                  name: 'test name',
                },
              ],
              currency: 'cad',
              totals: {
                months: [
                  {
                    month: '2020-10-01',
                    total: 1836.32,
                  },
                  {
                    month: '2020-11-01',
                    total: 1836.32,
                  },
                  {
                    month: '2020-12-01',
                    total: 1836.32,
                  },
                  {
                    month: '2021-1-01',
                    total: 1836.32,
                  },
                ],
              },
            },
          ],
        },
      },
    };

    const { getByTestId, queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery> mocks={mocks}>
          <SalaryReportTable accountListId={accountListId} title={title} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingSalaryReport')).not.toBeInTheDocument();
    });

    expect(getByText('test title')).toBeInTheDocument();
    const table = getByTestId('SalaryReportTable');
    expect(table).toBeInTheDocument();
    const tableHead = getByTestId('SalaryReportTableHead');
    expect(tableHead).toBeInTheDocument();
    expect(tableHead.parentElement?.tagName).toEqual('table');
  });

  it('empty', async () => {
    const mocks = {
      data: {
        fourteenMonthReport: {
          currencyGroups: [],
        },
      },
    };

    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery> mocks={mocks}>
          <SalaryReportTable accountListId={accountListId} title={title} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingSalaryReport')).not.toBeInTheDocument();
    });

    expect(getByText('test title')).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeInTheDocument();
  });
});
