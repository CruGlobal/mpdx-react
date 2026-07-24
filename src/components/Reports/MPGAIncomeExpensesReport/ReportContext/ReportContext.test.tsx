import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { MpgaTransactionsQuery } from '../MPGATransactions.generated';
import { useReport } from './ReportContext';

const mutationSpy = jest.fn();
const lastCompletedYear = 2019;

beforeEach(() => {
  mutationSpy.mockClear();
});

function FailedConsumer() {
  const context = useReport();
  return <div>{JSON.stringify(context)}</div>;
}

function TestConsumer() {
  const {
    incomeTotal,
    expensesTotal,
    ministryTotal,
    healthcareTotal,
    assessmentTotal,
    benefitsTotal,
    salaryTotal,
    otherTotal,
  } = useReport();

  return (
    <div>
      <div data-testid="income">{incomeTotal}</div>
      <div data-testid="expenses">{expensesTotal}</div>
      <div data-testid="ministry">{ministryTotal}</div>
      <div data-testid="healthcare">{healthcareTotal}</div>
      <div data-testid="assessment">{assessmentTotal}</div>
      <div data-testid="benefits">{benefitsTotal}</div>
      <div data-testid="salary">{salaryTotal}</div>
      <div data-testid="other">{otherTotal}</div>
    </div>
  );
}

function FilterConsumer() {
  const {
    setFilters,
    subtitle,
    firstFutureMonthIndex,
    incomeTotal,
    allData,
    transactionYears,
  } = useReport();

  return (
    <div>
      <div data-testid="subtitle">{subtitle}</div>
      <div data-testid="income">{incomeTotal}</div>
      <div data-testid="firstFutureMonthIndex">
        {firstFutureMonthIndex ?? 'none'}
      </div>
      <div data-testid="incomeMonthly">
        {(allData.income[0]?.monthly ?? []).join(',')}
      </div>
      <div data-testid="transactionYears">{transactionYears.join(',')}</div>
      <button
        onClick={() =>
          setFilters({
            selectedDateRange: null,
            selectedYear: lastCompletedYear,
            categories: null,
          })
        }
      >
        Pick Year
      </button>
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

describe('ReportContext', () => {
  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find ReportContext/i,
    );
    spy.mockRestore();
  });

  it('derives the correct totals from the MPGATransactions query', async () => {
    const { getByTestId } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <TestConsumer />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    await waitFor(() =>
      expect(getByTestId('income')).toHaveTextContent('108856'),
    );
    expect(getByTestId('expenses')).toHaveTextContent('20969');
    expect(getByTestId('ministry')).toHaveTextContent('2124');
    expect(getByTestId('healthcare')).toHaveTextContent('1933');
    expect(getByTestId('assessment')).toHaveTextContent('13779');
    expect(getByTestId('benefits')).toHaveTextContent('2400');
    expect(getByTestId('salary')).toHaveTextContent('26');
    expect(getByTestId('other')).toHaveTextContent('707');
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
        <div>Test Children</div>
      </MPGAIncomeExpensesReportTestWrapper>,
    );
    expect(getByText('Test Children')).toBeInTheDocument();
  });

  describe('date range', () => {
    it('queries the last 12 months by default with the default subtitle', async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <FilterConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      expect(getByTestId('subtitle')).toHaveTextContent('Last 12 Months');

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          startMonth: '2019-02-01',
          endMonth: '2020-01-01',
          fundTypes: ['Primary'],
        }),
      );
    });

    it('queries the full selected year and shows the month range', async () => {
      const { getByTestId, getByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <FilterConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      userEvent.click(getByRole('button', { name: 'Pick Year' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          startMonth: `${lastCompletedYear}-01-01`,
          endMonth: `${lastCompletedYear}-12-31`,
          fundTypes: ['Primary'],
        }),
      );
      expect(getByTestId('subtitle')).toHaveTextContent(
        `January ${lastCompletedYear} – December ${lastCompletedYear}`,
      );
    });

    it('queries the current year up to today for Year to Date and zero-fills future months', async () => {
      const { getByTestId, getByRole } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <FilterConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(getByTestId('income')).toHaveTextContent('108856'),
      );

      userEvent.click(getByRole('button', { name: 'Year to Date' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          startMonth: '2020-01-01',
          endMonth: '2020-01-01',
          fundTypes: ['Primary'],
        }),
      );

      await waitFor(() =>
        expect(getByTestId('firstFutureMonthIndex')).toHaveTextContent('1'),
      );
      await waitFor(() =>
        expect(getByTestId('incomeMonthly')).toHaveTextContent(
          '6770,0,0,0,0,0,0,0,0,0,0,0',
        ),
      );
    });
  });

  describe('transaction years', () => {
    it('excludes the current year from the list', async () => {
      const yearsMock: MpgaTransactionsQuery = {
        reportsStaffExpenses: {
          transactionYears: [2018, 2019, 2020],
          funds: [],
        },
      };

      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper
          mocks={yearsMock}
          onCall={mutationSpy}
        >
          <FilterConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(getByTestId('transactionYears')).toHaveTextContent(
          /^2018,2019$/,
        ),
      );
    });
  });
});
