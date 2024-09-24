import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { FourteenMonthReport } from './FourteenMonthReport';
import {
  FourteenMonthReportDocument,
  FourteenMonthReportQuery,
} from './GetFourteenMonthReport.generated';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();
const getContactUrl = jest.fn().mockReturnValue('test-url');
const defaultProps = {
  accountListId,
  title,
  onNavListToggle,
  getContactUrl,
  isNavListOpen: false,
};

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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
                  total: 50,
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
          currency: 'CAD',
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
        {
          contacts: [
            {
              accountNumbers: ['101823'],
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
                      currency: 'USD',
                      date: '2020-07-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-10-01',
                  total: 50,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'USD',
                      date: '2020-11-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-11-01',
                  total: 50,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'USD',
                      date: '2020-12-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-12-01',
                  total: 50,
                },
                {
                  donations: [
                    {
                      amount: 85,
                      currency: 'USD',
                      date: '2021-1-15',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2021-1-01',
                  total: 50,
                },
              ],
              name: 'test name',
              pledgeAmount: null,
              pledgeCurrency: 'USD',
              pledgeFrequency: null,
              status: null,
              total: 1290,
            },
          ],
          currency: 'USD',
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
    const { getByTestId, getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Salary}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
            getContactUrl={getContactUrl}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('salary report loaded', async () => {
    const { getAllByTestId, queryByTestId, getAllByRole } = render(
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
            getContactUrl={getContactUrl}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getAllByRole('table')).toHaveLength(2);
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(3);
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
  });

  it('partner report loading', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
            getContactUrl={getContactUrl}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('partner report loaded', async () => {
    const { getAllByTestId, queryByTestId, getByText } = render(
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
            getContactUrl={getContactUrl}
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
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
  });

  it('salary report error', async () => {
    const { queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={[errorMock]}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Salary}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
            getContactUrl={getContactUrl}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('Notification')).toBeInTheDocument();
  });

  it('partner report error', async () => {
    const { queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={[errorMock]}>
          <FourteenMonthReport
            accountListId={accountListId}
            currencyType={FourteenMonthReportCurrencyType.Donor}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
            getContactUrl={getContactUrl}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('Notification')).toBeInTheDocument();
  });

  it('nav list closed', async () => {
    const { getAllByTestId, getByText, queryByTestId } = render(
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
            getContactUrl={getContactUrl}
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
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
    expect(queryByTestId('MultiPageMenu')).not.toBeInTheDocument();
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
            getContactUrl={getContactUrl}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FourteenMonthReport', {
        designationAccountIds: ['account-1'],
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
            getContactUrl={getContactUrl}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FourteenMonthReport', {
        designationAccountIds: null,
      }),
    );
  });

  it('can click on a contact name', async () => {
    const mutationSpy = jest.fn();
    const { findAllByRole, findByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FourteenMonthReportQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <FourteenMonthReport
            {...defaultProps}
            isNavListOpen={true}
            currencyType={FourteenMonthReportCurrencyType.Donor}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getContactUrl).toHaveBeenCalledWith('contact-1');
    expect(await findByText('Totals')).toBeInTheDocument();
    const contactLinks = await findAllByRole('link', { name: 'test name' });
    expect(contactLinks[0]).toHaveAttribute('href', '/test-url');
  });

  describe('partner report', () => {
    it('should render one table for each partner currency', async () => {
      const { findAllByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<FourteenMonthReportQuery> mocks={mocks}>
            <FourteenMonthReport
              {...defaultProps}
              currencyType={FourteenMonthReportCurrencyType.Donor}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      const tables = await findAllByRole('table', {
        name: 'Fourteen month report table',
      });
      expect(tables).toHaveLength(2);

      expect(
        within(tables[0]).getByRole('heading', { name: 'CAD' }),
      ).toBeInTheDocument();
      const table1MonthlyTotals = within(tables[0]).getAllByTestId(
        'monthlyTotals',
      );
      // There are 2 contacts in this table who each gave 50
      expect(table1MonthlyTotals[0]).toHaveTextContent('100');
      expect(table1MonthlyTotals[1]).toHaveTextContent('100');
      expect(table1MonthlyTotals[2]).toHaveTextContent('100');
      expect(table1MonthlyTotals[3]).toHaveTextContent('100');
      expect(within(tables[0]).getByTestId('overallTotal')).toHaveTextContent(
        '400',
      );

      expect(
        within(tables[1]).getByRole('heading', { name: 'USD' }),
      ).toBeInTheDocument();
      const table2MonthlyTotals = within(tables[1]).getAllByTestId(
        'monthlyTotals',
      );
      // There is 1 contact in this table who gave 50
      expect(table2MonthlyTotals[0]).toHaveTextContent('50');
      expect(table2MonthlyTotals[1]).toHaveTextContent('50');
      expect(table2MonthlyTotals[2]).toHaveTextContent('50');
      expect(table2MonthlyTotals[3]).toHaveTextContent('50');
      expect(within(tables[1]).getByTestId('overallTotal')).toHaveTextContent(
        '200',
      );
    });
  });
});
