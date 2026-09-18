import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { MpgaTransactionsQuery } from '../MPGATransactions.generated';
import { useBalanceTableData } from './useBalanceTableData';

const mutationSpy = jest.fn();

function TestConsumer() {
  const rows = useBalanceTableData();
  const { setFilters } = useMPGAIncomeExpenses();
  const monthly = rows[0]?.monthly ?? [];

  return (
    <div>
      <div data-testid="rowCount">{rows.length}</div>
      <div data-testid="description">{rows[0]?.description ?? 'none'}</div>
      <div data-testid="monthly">{monthly.join(',')}</div>
      <div data-testid="average">{rows[0]?.average ?? 'none'}</div>
      <button
        onClick={() =>
          setFilters({
            selectedDateRange: DateRange.YearToDate,
            selectedYear: null,
            categories: null,
          })
        }
      >
        Year to Date
      </button>
    </div>
  );
}

const renderConsumer = (mocks?: MpgaTransactionsQuery, isEmpty?: boolean) =>
  render(
    <MPGAIncomeExpensesReportTestWrapper
      onCall={mutationSpy}
      mocks={mocks}
      isEmpty={isEmpty}
    >
      <TestConsumer />
    </MPGAIncomeExpensesReportTestWrapper>,
  );

describe('useBalanceTableData', () => {
  it('walks the fund start balance forward by each month net', async () => {
    const { getByTestId } = renderConsumer();

    await waitFor(() =>
      expect(getByTestId('monthly')).toHaveTextContent(
        /^17709,22845,27500,32751,39545,45109,50965,57991,65704,73016,82595,99183$/,
      ),
    );
    expect(getByTestId('description')).toHaveTextContent('Ending Balance');
  });

  it('averages the balance across the months shown', async () => {
    const { getByTestId } = renderConsumer();

    await waitFor(() =>
      expect(getByTestId('average')).toHaveTextContent('51242.75'),
    );
  });

  it('returns no rows when the report has no funds', async () => {
    const { getByTestId } = renderConsumer(undefined, true);

    await waitFor(() => expect(getByTestId('rowCount')).toHaveTextContent('0'));
  });

  it('still returns a row for a fund whose balance is zero', async () => {
    const { getByTestId } = renderConsumer({
      reportsStaffExpenses: {
        name: 'Test Account',
        transactionYears: [],
        funds: [
          {
            id: 'fund-1',
            fundType: 'Primary',
            total: 0,
            startBalance: 0,
            categories: [],
          },
        ],
      },
    });

    await waitFor(() => expect(getByTestId('rowCount')).toHaveTextContent('1'));
    expect(getByTestId('monthly')).toHaveTextContent(
      /^0,0,0,0,0,0,0,0,0,0,0,0$/,
    );
  });

  it('stops at the first future month rather than carrying the balance forward', async () => {
    const { getByTestId, getByRole } = renderConsumer();

    await waitFor(() =>
      expect(getByTestId('monthly')).toHaveTextContent(/^17709,/),
    );

    userEvent.click(getByRole('button', { name: 'Year to Date' }));

    await waitFor(() =>
      expect(getByTestId('monthly')).toHaveTextContent(/^17709$/),
    );
  });
});
