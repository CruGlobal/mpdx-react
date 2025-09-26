import { TFunction } from 'i18next';
import { buildURI } from 'react-csv/lib/core';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { ReportType } from '../Helpers/StaffReportEnum';

const createTable = (
  title: string,
  csvHeader: string[],
  transactions: Transaction[],
  locale: string,
) => {
  const csvData = [
    [title],
    csvHeader,
    ...transactions.map((transaction) => [
      transaction.month,
      transaction.category,
      transaction.total.toLocaleString(locale, {
        style: 'currency',
        currency: 'USD',
      }),
    ]),
  ];

  return csvData;
};

function createCombinedReport(
  transactions: Transaction[],
  titles: { income: string; expense: string },
  csvHeader: string[],
  locale: string,
) {
  const income = transactions.filter((transaction) => transaction.total > 0);
  const expenses = transactions.filter((transaction) => transaction.total < 0);
  const incomeData = createTable(titles.income, csvHeader, income, locale);
  const expenseData = createTable(titles.expense, csvHeader, expenses, locale);
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

  const csvHeader = [t('Date'), t('Category'), t('Amount')];

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
      locale,
    );
  } else {
    csvData = createTable(reportTitle, csvHeader, transactions, locale);
  }

  downloadCsvReport(csvData, reportTitle);
};
