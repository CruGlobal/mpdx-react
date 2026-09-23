import { TFunction } from 'i18next';
import {
  GroupedTransaction,
  Transaction,
  isGroupedTransaction,
} from './filterTransactions';

/**
 * How a row reads when some of it is dated after today, or null when none of it is. A rolled up
 * row that is only partly pending counts its pending transactions, since the total mixes both.
 */
export const getPendingLabel = (
  transaction: Transaction | GroupedTransaction,
  t: TFunction,
): string | null => {
  if (!isGroupedTransaction(transaction)) {
    return transaction.isPending ? t('Pending') : null;
  }

  const total = transaction.groupedTransactions.length;
  const pending = transaction.groupedTransactions.filter(
    ({ isPending }) => isPending,
  ).length;

  if (pending === 0) {
    return null;
  }
  return pending === total
    ? t('Pending')
    : t('Pending {{pending}} of {{total}}', { pending, total });
};
