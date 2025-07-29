import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { ReportType } from '../Helpers/StaffReportEnum';

const makeTable = (
  title: string,
  transactions: Transaction[],
  // translation function
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

  let csvData: string[][] = [];
  if (type === ReportType.Income) {
    csvData = makeTable('Income Report', transactions, t);
  } else if ((type === ReportType.Expense, t)) {
    csvData = makeTable('Expense Report', transactions, t);
  } else if (type === ReportType.Combined) {
    const income = transactions.filter((transaction) => transaction.total > 0);
    const expenses = transactions.filter(
      (transaction) => transaction.total < 0,
    );
    const incomeData = makeTable('Income Report', income, t);
    const expenseData = makeTable('Expense Report', expenses, t);
    csvData = [...incomeData, [''], ...expenseData];
  }

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  const currentDate = DateTime.now().toISODate();
  const title = t(
    (type ? type.charAt(0).toUpperCase() + type.slice(1) : '') +
      ' Report ' +
      currentDate +
      '.csv',
  );
  link.setAttribute('download', title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
