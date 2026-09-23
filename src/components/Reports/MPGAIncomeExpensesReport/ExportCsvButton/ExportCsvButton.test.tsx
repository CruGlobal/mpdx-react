import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import {
  ContextType,
  MPGAIncomeExpensesContext,
} from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { MpgaTransactionsQuery } from '../MPGATransactions.generated';
import { mockData, months } from '../mockData';
import { ExportCsvButton } from './ExportCsvButton';

const mutationSpy = jest.fn();

jest.mock('../CustomExport/CustomExport', () => ({
  exportToCsv: jest.fn(),
}));

const TestComponent: React.FC<{
  isEmpty?: boolean;
  mocks?: MpgaTransactionsQuery;
}> = ({ isEmpty = false, mocks }) => (
  <MPGAIncomeExpensesReportTestWrapper
    onCall={mutationSpy}
    isEmpty={isEmpty}
    mocks={mocks}
  >
    <ExportCsvButton />
  </MPGAIncomeExpensesReportTestWrapper>
);

describe('ExportCsvButton', () => {
  beforeEach(() => {
    (exportToCsv as jest.Mock).mockClear();
  });

  it('renders an Export CSV button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('opens a menu with Income and Expenses options when clicked', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Expenses Report' }),
    ).toBeInTheDocument();
  });

  it('exports the income CSV when Income is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    const income = await findByRole('menuitem', { name: 'Income Report' });
    await waitFor(() =>
      expect(income).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(income);

    expect(exportToCsv).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          category: StaffExpenseCategoryEnum.Donation,
        }),
      ]),
      ReportTypeEnum.Income,
      expect.any(Array),
      'en-US',
    );
  });

  it('exports the balance CSV when Balance is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    const balance = await findByRole('menuitem', { name: 'Balance Report' });
    await waitFor(() =>
      expect(balance).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(balance);

    expect(exportToCsv).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ description: 'Ending Balance' }),
      ]),
      ReportTypeEnum.Balance,
      expect.any(Array),
      'en-US',
    );
  });

  it('exports the expenses CSV when Expenses is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    const expenses = await findByRole('menuitem', { name: 'Expenses Report' });
    await waitFor(() =>
      expect(expenses).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(expenses);

    expect(exportToCsv).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          category: StaffExpenseCategoryEnum.Assessment,
        }),
      ]),
      ReportTypeEnum.Expenses,
      expect.any(Array),
      'en-US',
    );
  });

  it('disables an export option when its dataset is empty', async () => {
    const incomeOnlyMock: MpgaTransactionsQuery = {
      reportsStaffExpenses: {
        name: 'Test Account',
        transactionYears: [],
        funds: [
          {
            id: 'fund-1',
            fundType: 'Primary',
            total: 5000,
            startBalance: 0,
            categories: [
              {
                category: StaffExpenseCategoryEnum.Donation,
                averagePerMonth: 5000,
                total: 5000,
                breakdownByMonth: [{ month: '2019-02-01', total: 5000 }],
                subcategories: [],
              },
            ],
          },
        ],
      },
    };

    const { getByRole, findByRole } = render(
      <TestComponent mocks={incomeOnlyMock} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    const expenses = await findByRole('menuitem', { name: 'Expenses Report' });
    expect(expenses).toHaveAttribute('aria-disabled', 'true');
    await waitFor(() =>
      expect(
        getByRole('menuitem', { name: 'Income Report' }),
      ).not.toHaveAttribute('aria-disabled'),
    );
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  it('disables both export options when all datasets are empty', async () => {
    const { getByRole, findByRole } = render(<TestComponent isEmpty />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      await findByRole('menuitem', { name: 'Expenses Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  it('disables all exports while the report is still loading', async () => {
    // Rows can exist before the household has answered, and an export taken then would show a
    // couple's salary as one row. Only the finished report is exportable.
    const loadingContext = {
      allData: mockData,
      dataLoading: true,
      monthLabels: months,
      startBalance: null,
    } as unknown as ContextType;

    const { getByRole, findByRole } = render(
      <MPGAIncomeExpensesContext.Provider value={loadingContext}>
        <ExportCsvButton />
      </MPGAIncomeExpensesContext.Provider>,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(getByRole('menuitem', { name: 'Expenses Report' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(getByRole('menuitem', { name: 'Balance Report' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('closes the menu after an export is selected', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Export CSV' }));

    const income = await findByRole('menuitem', { name: 'Income Report' });
    await waitFor(() =>
      expect(income).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(income);

    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Income Report' }),
      ).not.toBeInTheDocument(),
    );
  });
});
