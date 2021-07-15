import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { FourteenMonthReportTable } from './Table';
import theme from 'src/theme';

const onRequestSort = jest.fn();
const ref = useRef(null);

//TODO: Need test coverage for error state

describe('FourteenMonthReportTable', () => {
  it('default', async () => {
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
                      salaryCurrencyTotal: 255,
                      total: 35,
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
                      salaryCurrencyTotal: 255,
                      total: 35,
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
                      salaryCurrencyTotal: 255,
                      total: 35,
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
                      salaryCurrencyTotal: 255,
                      total: 35,
                    },
                  ],
                  minimum: 255,
                  name: 'test name',
                  pledgeAmount: null,
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
                year: 24613,
              },
            },
          ],
        },
      },
    };

    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
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
          ref={ref}
          totals={
            mocks.FourteenMonthReport.fourteenMonthReport.currencyGroups[0]
              .totals
          }
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });
});
