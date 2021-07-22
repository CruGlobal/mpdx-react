import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { FourteenMonthReport } from './FourteenMonthReport';
import { FourteenMonthReportQuery } from './GetFourteenMonthReport.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const currencyType = 'salary';
const onNavListToggle = jest.fn();

//TODO: Need test coverage for error state

describe('FourteenMonthReport', () => {
  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery>>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={currencyType}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('salary report loaded', async () => {
    const mocks = {
      FourteenMonthReport: {
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
          salaryCurrency: 'CAD',
        },
      },
    };

    const { queryByTestId, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery> mocks={mocks}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={currencyType}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByText('test name')).toBeInTheDocument();
    expect(queryByText('CAD')).toBeInTheDocument();
  });

  it('empty', async () => {
    const mocks = {
      FourteenMonthReport: {
        fourteenMonthReport: {
          currencyGroups: [],
        },
      },
    };

    const { queryByTestId, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery> mocks={mocks}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={currencyType}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeInTheDocument();
    expect(
      queryByText('You have received no donations in the last thirteen months'),
    ).toBeInTheDocument();
  });
});
