import { DateTime } from 'luxon';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { currencyFormat } from 'src/lib/intlFormat';
import { ReportType } from '../Helpers/StaffReportEnum';

const csvHeader = ['Date', 'Category', 'Amount'];

const makeTable = (
  title: string,
  transactions: Transaction[],
  type: ReportType,
  locale: string,
) => {
  if (type === ReportType.Income) {
    transactions = transactions.filter((transaction) => transaction.total > 0);
  } else if (type === ReportType.Expense) {
    transactions = transactions.filter((transaction) => transaction.total < 0);
  }
  const csvEscape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;

  const rows = transactions.map((transaction) => {
    const date = DateTime.fromISO(transaction.month).toFormat('MM/dd/yyyy');
    const amount = currencyFormat(transaction.total, 'USD', locale, {
      showTrailingZeros: true,
    });
    return [date, transaction.category, amount].map(csvEscape).join(',');
  });
  return [title, csvHeader.join(','), ...rows, ''].join('\n');
};

export const downloadCsv = (
  type: ReportType,
  enqueueSnackbar: (message: string, options?: { variant: string }) => void,
  transactions: Transaction[] | undefined,
  locale: string = 'en-US',
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
      locale,
    );
  } else if (type === ReportType.Expense) {
    csvContent += makeTable(
      'Expense Report',
      expenseTransactions,
      ReportType.Expense,
      locale,
    );
  } else if (type === ReportType.Combined) {
    csvContent +=
      makeTable(
        'Income Report',
        incomeTransactions,
        ReportType.Income,
        locale,
      ) +
      '\n' +
      makeTable(
        'Expense Report',
        expenseTransactions,
        ReportType.Expense,
        locale,
      );
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
