import { DateTime } from 'luxon';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { ReportType } from '../Helpers/StaffReportEnum';

const csvHeader = ['Date', 'Category', 'Amount'];

const makeTable = (
  title: string,
  transactions: Transaction[],
  type: ReportType,
) => {
  if (type === ReportType.Income) {
    transactions = transactions.filter((transaction) => transaction.total > 0);
  } else if (type === ReportType.Expense) {
    transactions = transactions.filter((transaction) => transaction.total < 0);
  }
  const rows = transactions.map((transaction) =>
    [transaction.month, transaction.category, transaction.total].join(','),
  );
  return [title, csvHeader.join(','), ...rows, ''].join('\n');
};

export const downloadCsv = (
  type: ReportType,
  enqueueSnackbar: (message: string, options?: { variant: string }) => void,
  transactions: Transaction[] | undefined,
) => {
  if (!Object.values(ReportType).includes(type)) {
    return;
  }

  if (!transactions || transactions.length === 0) {
    enqueueSnackbar('No transactions to download', { variant: 'error' });
    return;
  }

  const incomeTransactions = transactions.filter((t) => t.total > 0);
  const expenseTransactions = transactions.filter((t) => t.total < 0);

  let csvContent = 'data:text/csv;charset=utf-8,';
  if (type === ReportType.Income) {
    csvContent += makeTable(
      'Income Report',
      incomeTransactions,
      ReportType.Income,
    );
  } else if (type === ReportType.Expense) {
    csvContent += makeTable(
      'Expense Report',
      expenseTransactions,
      ReportType.Expense,
    );
  } else if (type === ReportType.Combined) {
    csvContent +=
      makeTable('Income Report', incomeTransactions, ReportType.Income) +
      '\n' +
      makeTable('Expense Report', expenseTransactions, ReportType.Expense);
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const currentDate = DateTime.now().toISODate();
  link.setAttribute(
    'download',
    (type ? type.charAt(0).toUpperCase() + type.slice(1) : '') +
      ' Report ' +
      currentDate +
      '.csv',
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
