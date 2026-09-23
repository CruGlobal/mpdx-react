import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import {
  MPGAIncomeExpensesReportTestWrapper,
  hcmHouseholdMock,
} from '../MPGAIncomeExpensesReportTestWrapper';
import { MpgaTransactionsQuery } from '../MPGATransactions.generated';
import {
  MPGAIncomeExpensesReportProvider,
  useMPGAIncomeExpenses,
} from './MPGAIncomeExpensesContext';

const mutationSpy = jest.fn();
const lastCompletedYear = 2019;

beforeEach(() => {
  mutationSpy.mockClear();
});

function FailedConsumer() {
  const context = useMPGAIncomeExpenses();
  return <div>{JSON.stringify(context)}</div>;
}

function TestConsumer() {
  const {
    totals: {
      income,
      expenses,
      ministry,
      healthcare,
      assessment,
      benefits,
      salary,
      other,
    },
  } = useMPGAIncomeExpenses();

  return (
    <div>
      <div data-testid="income">{income}</div>
      <div data-testid="expenses">{expenses}</div>
      <div data-testid="ministry">{ministry}</div>
      <div data-testid="healthcare">{healthcare}</div>
      <div data-testid="assessment">{assessment}</div>
      <div data-testid="benefits">{benefits}</div>
      <div data-testid="salary">{salary}</div>
      <div data-testid="other">{other}</div>
    </div>
  );
}

function FilterConsumer() {
  const {
    setFilters,
    subtitle,
    firstFutureMonthIndex,
    totals: { income },
    allData,
    transactionYears,
  } = useMPGAIncomeExpenses();

  return (
    <div>
      <div data-testid="subtitle">{subtitle}</div>
      <div data-testid="income">{income}</div>
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

function IncomeRowsConsumer() {
  const { allData, dataLoading } = useMPGAIncomeExpenses();

  return (
    <div>
      <div data-testid="dataLoading">{String(dataLoading)}</div>
      <div data-testid="incomeRows">
        {allData.income.map((row) => row.description).join('|')}
      </div>
    </div>
  );
}

function StaffAccountConsumer() {
  const { staffName, isSupervisorView } = useMPGAIncomeExpenses();

  return (
    <div>
      <div data-testid="staffName">{staffName ?? 'none'}</div>
      <div data-testid="isSupervisorView">{String(isSupervisorView)}</div>
    </div>
  );
}

describe('MPGAIncomeExpensesContext', () => {
  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find MPGAIncomeExpensesContext/i,
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

  describe('supervisor view', () => {
    it('queries the logged-in user own report when no staffAccountId is given', async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <StaffAccountConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      expect(getByTestId('isSupervisorView')).toHaveTextContent('false');

      await waitFor(() =>
        expect(getByTestId('staffName')).toHaveTextContent('Test Account'),
      );
    });

    it('queries the given staff account and flags supervisor view', async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper
          staffAccountId="987654"
          onCall={mutationSpy}
        >
          <StaffAccountConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      expect(getByTestId('isSupervisorView')).toHaveTextContent('true');

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          staffAccountId: '987654',
          fundTypes: ['Primary'],
        }),
      );
    });

    it('exposes the staff account name from the response', async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper
          staffAccountId="987654"
          mocks={{
            reportsStaffExpenses: {
              name: 'Jane Doe',
              transactionYears: [],
              funds: [],
            },
          }}
          onCall={mutationSpy}
        >
          <StaffAccountConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(getByTestId('staffName')).toHaveTextContent('Jane Doe'),
      );
    });
  });

  describe('transaction years', () => {
    it('excludes the current year from the list', async () => {
      const yearsMock: MpgaTransactionsQuery = {
        reportsStaffExpenses: {
          name: 'Test Account',
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

  describe('household', () => {
    const payroll = (amount: number, personNumber: string | null) => ({
      id: `${personNumber}-${amount}`,
      amount,
      transactedAt: '2019-01-15T00:00:00Z',
      description: 'Payroll',
      personNumber,
    });

    const coupleSalaryMock: MpgaTransactionsQuery = {
      reportsStaffExpenses: {
        name: 'Test Account',
        transactionYears: [],
        funds: [
          {
            id: 'fund-1',
            fundType: 'Primary',
            startBalance: 0,
            total: 300,
            categories: [
              {
                category: StaffExpenseCategoryEnum.Salary,
                averagePerMonth: 300,
                total: 300,
                breakdownByMonth: [{ month: '2019-01-01', total: 300 }],
                subcategories: [
                  {
                    subCategory: StaffExpensesSubCategoryEnum.RegularPay,
                    averagePerMonth: 300,
                    total: 300,
                    breakdownByMonth: [
                      {
                        month: '2019-01-01',
                        total: 300,
                        transactions: [
                          payroll(200, '000000111'),
                          payroll(100, '000000222'),
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    it('requests your own household when no person number is given', async () => {
      render(
        <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
          <IncomeRowsConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('Hcm', {
          personNumber: undefined,
        }),
      );
    });

    it('requests the household of the staff member being viewed', async () => {
      render(
        <MPGAIncomeExpensesReportTestWrapper
          staffAccountId="987654"
          personNumber="000000111"
          onCall={mutationSpy}
        >
          <IncomeRowsConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('Hcm', {
          personNumber: '000000111',
        }),
      );
    });

    it('requests the report without waiting for the household', async () => {
      // A mock given as a function runs when the request leaves, and onCall runs when its
      // response lands, so the log shows whether the report waited on HCM.
      const log: string[] = [];
      const requestLogger =
        <T,>(name: string, data: T) =>
        () => {
          log.push(`request ${name}`);
          return data;
        };

      render(
        <GqlMockedProvider
          mocks={
            {
              Hcm: requestLogger('Hcm', hcmHouseholdMock),
              MPGATransactions: requestLogger(
                'MPGATransactions',
                coupleSalaryMock,
              ),
            } as unknown as Record<string, never>
          }
          onCall={({ operation }) =>
            log.push(`response ${operation.operationName}`)
          }
        >
          <MPGAIncomeExpensesReportProvider>
            <IncomeRowsConsumer />
          </MPGAIncomeExpensesReportProvider>
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(log).toContain('response MPGATransactions'));
      expect(log).toEqual([
        'request Hcm',
        'request MPGATransactions',
        'response Hcm',
        'response MPGATransactions',
      ]);
    });

    it('does not request a household for a supervisor with no person number', async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper
          staffAccountId="987654"
          onCall={mutationSpy}
        >
          <IncomeRowsConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(getByTestId('dataLoading')).toHaveTextContent('false'),
      );
      expect(mutationSpy).not.toHaveGraphqlOperation('Hcm');
    });

    it("splits a couple's salary into one row per person", async () => {
      const { getByTestId } = render(
        <MPGAIncomeExpensesReportTestWrapper
          mocks={coupleSalaryMock}
          hcmMocks={hcmHouseholdMock}
          onCall={mutationSpy}
        >
          <IncomeRowsConsumer />
        </MPGAIncomeExpensesReportTestWrapper>,
      );

      await waitFor(() =>
        expect(getByTestId('incomeRows')).toHaveTextContent(
          'Salary (Alex)|Salary (Jordan)',
        ),
      );
    });
  });
});
