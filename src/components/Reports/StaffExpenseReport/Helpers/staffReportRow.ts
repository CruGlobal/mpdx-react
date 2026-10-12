import { DateTime } from 'luxon';
import { currencyFormat } from 'src/lib/intlFormat';
import { ReportType } from './StaffReportEnum';
import {
  GroupedTransaction,
  Transaction,
  isGroupedTransaction,
} from './filterTransactions';
import { formatTransactionDate } from './formatDate';

export interface StaffReportRowPending {
  count: number;
  total: number;
}

/** What every output shows for one row, so the screen, print view and CSV cannot drift apart. */
export interface StaffReportRow {
  id: string;
  /** The day, or the month and year for a monthly rollup. */
  dateLabel: string;
  /** A rolled up row carries its bucket label; an itemized one shows what the transaction says. */
  description: string;
  /** Expenses read as positive. */
  amountLabel: string;
  /** Null when nothing in the row is pending. */
  pending: StaffReportRowPending | null;
  /** Raw values the screen grid sorts on. */
  date: DateTime;
  amount: number;
  /** Set on rolled up rows, for the breakdown dialog. */
  groupedTransaction?: GroupedTransaction;
}

const getPending = (
  transaction: Transaction | GroupedTransaction,
): StaffReportRowPending | null => {
  const members = isGroupedTransaction(transaction)
    ? transaction.groupedTransactions
    : [transaction];
  const count = members.filter(({ isPending }) => isPending).length;

  return count ? { count, total: members.length } : null;
};

/** Builds display rows in the order given. */
export const buildStaffReportRows = (
  transactions: (Transaction | GroupedTransaction)[],
  tableType: ReportType.Income | ReportType.Expense,
  locale: string,
): StaffReportRow[] =>
  transactions.map((transaction, index) => ({
    id: index.toString(),
    dateLabel: formatTransactionDate(transaction, locale),
    description: transaction.description || transaction.displayCategory,
    amountLabel: currencyFormat(
      tableType === ReportType.Expense
        ? Math.abs(transaction.amount)
        : transaction.amount,
      'USD',
      locale,
    ),
    pending: getPending(transaction),
    date: DateTime.fromISO(transaction.transactedAt),
    amount: transaction.amount,
    groupedTransaction: isGroupedTransaction(transaction)
      ? transaction
      : undefined,
  }));
