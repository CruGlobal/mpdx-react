import { TFunction } from 'i18next';
import { buildURI } from 'react-csv/lib/core';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/Helpers/filterTransactions';
import { currencyFormat } from 'src/lib/intlFormat';
import { ReportType } from '../Helpers/StaffReportEnum';
import { getDescriptionWithPending } from '../Helpers/pendingLabel';
import { buildStaffReportRows } from '../Helpers/staffReportRow';

const createTable = (
  title: string,
  csvHeader: string[],
  transactions: Transaction[],
  tableType: ReportType.Income | ReportType.Expense,
  t: TFunction,
  locale: string,
) => {
  const total = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return [
    [title],
    csvHeader,
    ...buildStaffReportRows(transactions, tableType, locale).map((row) => [
      row.dateLabel,
      getDescriptionWithPending(row, t),
      row.amountLabel,
    ]),
    [
      t('Total'),
      '',
      currencyFormat(
        tableType === ReportType.Expense ? Math.abs(total) : total,
        'USD',
        locale,
      ),
    ],
  ];
};

function createCombinedReport(
  transactions: Transaction[],
  titles: { income: string; expense: string },
  csvHeader: string[],
  t: TFunction,
  locale: string,
) {
  const income = transactions.filter((transaction) => transaction.amount > 0);
  const expenses = transactions.filter((transaction) => transaction.amount < 0);
  const incomeData = createTable(
    titles.income,
    csvHeader,
    income,
    ReportType.Income,
    t,
    locale,
  );
  const expenseData = createTable(
    titles.expense,
    csvHeader,
    expenses,
    ReportType.Expense,
    t,
    locale,
  );
  return [...incomeData, [''], ...expenseData];
}

const downloadCsvReport = (csvData: string[][], reportTitle: string) => {
  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', reportTitle + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createCsvReport = (
  type: ReportType,
  transactions: Transaction[],
  t: TFunction,
  locale: string,
) => {
  let reportTitle = '';
  if (type === ReportType.Income) {
    reportTitle = t('Income Report');
  } else if (type === ReportType.Expense) {
    reportTitle = t('Expense Report');
  } else if (type === ReportType.Combined) {
    reportTitle = t('Combined Report');
  }

  const csvHeader = [t('Date'), t('Description'), t('Amount')];

  let csvData: string[][] = [];

  if (type === ReportType.Combined) {
    const tableTitles = {
      income: t('Income Report'),
      expense: t('Expense Report'),
    };
    csvData = createCombinedReport(
      transactions,
      tableTitles,
      csvHeader,
      t,
      locale,
    );
  } else {
    csvData = createTable(
      reportTitle,
      csvHeader,
      transactions,
      type,
      t,
      locale,
    );
  }

  downloadCsvReport(csvData, reportTitle);
};
