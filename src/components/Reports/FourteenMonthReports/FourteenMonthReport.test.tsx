import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { FourteenMonthReportCurrencyType } from '../../../../graphql/types.generated';
import {
  FourteenMonthReportDocument,
  FourteenMonthReportQuery,
} from './GetFourteenMonthReport.generated';
import { FourteenMonthReport } from './FourteenMonthReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

const mocks = {
  FourteenMonthReport: {
    fourteenMonthReport: {
      currencyGroups: [
        {
          contacts: [
            {
              accountNumbers: ['10182'],
              average: 86,
              id: 'contact-1',
              lateBy30Days: false,
              lateBy60Days: false,
              minimum: 85,
              months: [
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-07-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-10-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-11-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-11-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-12-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-12-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2021-1-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2021-1-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
              ],
              name: 'test name',
              pledgeAmount: null,
              pledgeCurrency: 'CAD',
              pledgeFrequency: null,
              status: null,
              total: 1290,
            },
            {
              accountNumbers: ['10182'],
              average: 86,
              id: 'contact-2',
              lateBy30Days: false,
              lateBy60Days: false,
              minimum: 85,
              months: [
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-07-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-10-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-11-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-11-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2020-12-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-12-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'CAD',
                      date: '2021-1-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2021-1-01',
                  salaryCurrencyTotal: 85,
                  total: 35,
                },
              ],
              name: 'test name',
              pledgeAmount: null,
              pledgeCurrency: 'CAD',
              pledgeFrequency: null,
              status: null,
              total: 1290,
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

const errorMock: MockedResponse = {
  request: {
    query: FourteenMonthReportDocument,
  },
  error: {
    name: 'error',
    message: 'Error loading data.  Try again.',
  },
};

describe('FourteenMonthReport', () => {
  it('salary report loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Salary}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('salary report loaded', async () => {
    const { getAllByTestId, getByTestId, queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ FourteenMonthReport: FourteenMonthReportQuery }>
          mocks={mocks}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Salary}
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

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReportTableRow').length).toBe(2);
    expect(getByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('partner report loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('partner report loaded', async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ FourteenMonthReport: FourteenMonthReportQuery }>
          mocks={mocks}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
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

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('salary report error', async () => {
    const { queryByTestId, getByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={[errorMock]}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Salary}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('Notification')).toBeInTheDocument();
  });

  it('partner report error', async () => {
    const { queryByTestId, getByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={[errorMock]}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('Notification')).toBeInTheDocument();
  });

  it('nav list closed', async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ FourteenMonthReport: FourteenMonthReportQuery }>
          mocks={mocks}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={false}
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

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('FourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('ReportNavList')).toBeNull();
  });

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ FourteenMonthReport: FourteenMonthReportQuery }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            designationAccounts={['account-1']}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={false}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[1][0]).toMatchObject({
        operation: {
          operationName: 'FourteenMonthReport',
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
        <GqlMockedProvider<{ FourteenMonthReport: FourteenMonthReportQuery }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={false}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[1][0]).toMatchObject({
        operation: {
          operationName: 'FourteenMonthReport',
          variables: {
            designationAccountIds: null,
          },
        },
      }),
    );
  });
});
