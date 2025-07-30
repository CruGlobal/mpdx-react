import { buildURI } from 'react-csv/lib/core';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { ReportType } from '../Helpers/StaffReportEnum';

const makeTable = (
  title: string,
  transactions: Transaction[],
  // TFunction to translate text
  t: (key: string) => string,
) => {
  const csvHeader = [t('Date'), t('Category'), t('Amount')];

  const csvData = [
    [title],
    csvHeader,
    ...transactions.map((transaction) => [
      transaction.month,
      transaction.category,
      transaction.total.toString(),
    ]),
  ];

  return csvData;
};

export const downloadCsv = (
  type: ReportType,
  enqueueSnackbar: (message: string, options?: { variant: string }) => void,
  transactions: Transaction[],
  // translation function
  t: (key: string) => string,
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

  let csvData: string[][] = [];
  const reportTitle = titles[type];
  if (type === ReportType.Income) {
    csvData = makeTable(reportTitle, transactions, t);
  } else if (type === ReportType.Expense) {
    csvData = makeTable(reportTitle, transactions, t);
  } else if (type === ReportType.Combined) {
    const income = transactions.filter((transaction) => transaction.total > 0);
    const expenses = transactions.filter(
      (transaction) => transaction.total < 0,
    );
    const incomeData = makeTable(titles[ReportType.Income], income, t);
    const expenseData = makeTable(titles[ReportType.Expense], expenses, t);
    csvData = [...incomeData, [''], ...expenseData];
  }

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', reportTitle + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
