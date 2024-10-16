import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { FourteenMonthReportTable } from './Table';

const onRequestSort = jest.fn();
const onSelectContact = jest.fn();

const mocks = {
  FourteenMonthReport: {
    fourteenMonthReport: {
      currencyGroups: [
        {
          contacts: [
            {
              accountNumbers: ['11609'],
              average: 258,
              id: 'contact-1',
              lateBy30Days: false,
              lateBy60Days: false,
              months: [
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-10-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-11-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-12-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2021-1-01',
                  total: 255,
                },
              ],
              minimum: 255,
              name: 'test name',
              pledgeAmount: null,
              status: null,
              total: 3366,
            },
            {
              accountNumbers: ['11610'],
              average: 258,
              id: 'contact-2',
              lateBy30Days: false,
              lateBy60Days: false,
              months: [
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-10-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-11-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2020-12-01',
                  total: 255,
                },
                {
                  donations: [
                    {
                      amount: 255,
                      currency: 'CAD',
                      date: '2020-06-04',
                      paymentMethod: 'BANK_TRANS',
                    },
                  ],
                  month: '2021-1-01',
                  total: 255,
                },
              ],
              minimum: 255,
              name: 'name again',
              pledgeAmount: 15.65,
              pledgeCurrency: 'USD',
              status: null,
              total: 3366,
            },
          ],
          currency: 'cad',
          totals: {
            average: 1831,
            minimum: 1583,
            months: [
              {
                month: '2020-10-01',
                total: 1836.32,
              },
              {
                month: '2020-11-01',
                total: 1486.99,
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
            year: 24613,
          },
        },
      ],
    },
  },
};

const totals = [
  {
    month: '2020-10-01',
    total: 1836.32,
  },
  {
    month: '2020-11-01',
    total: 1486.99,
  },
  {
    month: '2020-12-01',
    total: 1836.32,
  },
  {
    month: '2021-1-01',
    total: 1836.32,
  },
];

describe('FourteenMonthReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReportTable
            isExpanded={true}
            order="asc"
            orderBy={null}
            orderedContacts={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .contacts
            }
            salaryCurrency={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .currency
            }
            onRequestSort={onRequestSort}
            onSelectContact={onSelectContact}
            totals={totals}
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
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(2);
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('3,366');
  });

  it('should order by name', async () => {
    const { getAllByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReportTable
            isExpanded={true}
            order="asc"
            orderBy="name"
            orderedContacts={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .contacts
            }
            salaryCurrency={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .currency
            }
            onRequestSort={onRequestSort}
            onSelectContact={onSelectContact}
            totals={totals}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const fourteenMonthReportRow = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(fourteenMonthReportRow).toHaveLength(2);
    expect(fourteenMonthReportRow[0]).toHaveTextContent('test name');
    expect(fourteenMonthReportRow[1]).toHaveTextContent('name again');
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { getByText, queryByTestId, getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReportTable
            isExpanded={true}
            order="asc"
            orderBy="name"
            orderedContacts={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .contacts
            }
            salaryCurrency={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .currency
            }
            onRequestSort={onRequestSort}
            onSelectContact={onSelectContact}
            totals={totals}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.click(getByText('name again'));
    expect(onSelectContact).toHaveBeenCalledWith('contact-2');
    await waitFor(() => {
      expect(getAllByTestId('pledgeAmount')[1]).toHaveTextContent('16 USD');
    });
  });

  it('should calculate the correct monthly totals', async () => {
    const { queryByTestId, getByTestId, getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <FourteenMonthReportTable
            isExpanded={true}
            order="asc"
            orderBy="name"
            orderedContacts={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .contacts
            }
            salaryCurrency={
              mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
                .currency
            }
            onRequestSort={onRequestSort}
            onSelectContact={onSelectContact}
            totals={totals}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const contactTotal = getAllByTestId('monthlyTotals');
    expect(contactTotal[0]).toHaveTextContent('1,836');
    expect(contactTotal[1]).toHaveTextContent('1,487');
    expect(contactTotal[2]).toHaveTextContent('1,836');
    expect(contactTotal[3]).toHaveTextContent('1,836');

    expect(getByTestId('averageTotal')).toHaveTextContent('516');
    expect(getByTestId('minimumTotal')).toHaveTextContent('510');
    expect(getAllByTestId('overallTotal')[0]).toHaveTextContent('6,996');
  });
});
