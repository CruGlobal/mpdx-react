import { TFunction } from 'i18next';
import { buildURI } from 'react-csv/lib/core';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { ReportType } from '../Helpers/StaffReportEnum';

const makeTable = (
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
  titles: { income: string; expense: string; combined: string },
  csvHeader: string[],
  locale: string,
) {
  const income = transactions.filter((transaction) => transaction.total > 0);
  const expenses = transactions.filter((transaction) => transaction.total < 0);
  const incomeData = makeTable(
    titles[ReportType.Income],
    csvHeader,
    income,
    locale,
  );
  const expenseData = makeTable(
    titles[ReportType.Expense],
    csvHeader,
    expenses,
    locale,
  );
  return [...incomeData, [''], ...expenseData];
}

export const downloadCsv = (
  type: ReportType,
  enqueueSnackbar: (message: string, options?: { variant: string }) => void,
  transactions: Transaction[],
  t: TFunction,
  locale: string,
) => {
  if (!transactions || transactions.length === 0) {
    enqueueSnackbar(t('No transactions to download'), { variant: 'error' });
    return;
  }

  const titles = {
    [ReportType.Income]: t('Income Report'),
    [ReportType.Expense]: t('Expense Report'),
    [ReportType.Combined]: t('Combined Report'),
  };
  const csvHeader = [t('Date'), t('Category'), t('Amount')];

  let csvData: string[][] = [];

  const reportTitle = titles[type];
  if (type === ReportType.Combined) {
    csvData = createCombinedReport(transactions, titles, csvHeader, locale);
  } else {
    csvData = makeTable(reportTitle, csvHeader, transactions, locale);
  }

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', reportTitle + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
