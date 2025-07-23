import { DateTime } from 'luxon';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';

const csvHeader = ['Date', 'Category', 'Amount'];

export type ReportType = 'income' | 'expense' | 'full';

const makeTable = (
  title: string,
  transactions: Transaction[],
  type: ReportType,
) => {
  if (type === 'income') {
    transactions = transactions.filter((transaction) => transaction.total > 0);
  } else if (type === 'expense') {
    transactions = transactions.filter((transaction) => transaction.total < 0);
  }
  const rows = transactions.map((transaction) =>
    [transaction.month, transaction.category, transaction.total].join(','),
  );
  return [title, csvHeader.join(','), ...rows, ''].join('\n');
};

export const downloadCsv = (transactions: Transaction[], type?: ReportType) => {
  const incomeTransactions = transactions.filter((t) => t.total > 0);
  const expenseTransactions = transactions.filter((t) => t.total < 0);

  let csvContent = 'data:text/csv;charset=utf-8,';
  if (type === 'income') {
    csvContent += makeTable('Income Report', incomeTransactions, 'income');
  } else if (type === 'expense') {
    csvContent += makeTable('Expense Report', expenseTransactions, 'expense');
  } else {
    csvContent +=
      makeTable('Income Report', incomeTransactions, 'income') +
      '\n' +
      makeTable('Expense Report', expenseTransactions, 'expense');
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
