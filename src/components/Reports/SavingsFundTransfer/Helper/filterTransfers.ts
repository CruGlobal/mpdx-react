import { DateTime } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';

// index is the position of the summarized transfer in the filtered array
// seenMonths is a set of months that have been seen for the recurring transfer
// transactions is a map of transaction IDs to the original transaction objects
interface Summary {
  index: number;
  seenMonths: Set<string>;
  transactions: Map<string, Transactions>;
}

// Transfer history contains multiple transactions for recurring transfers.
// This hook summarizes those recurring transfers into a single transaction with the total amount.
// It also identifies any missed transfers and includes them as separate transactions with a failed status.
export function filteredTransfers(transfers: Transactions[]) {
  const filtered: Transactions[] = [];
  const upcoming: Transactions[] = [];
  const summary = new Map<string, Summary>();

  for (const transfer of transfers) {
    // If there's no transaction, it's an upcoming transfer.
    if (!transfer.transaction) {
      upcoming.push(transfer);
      continue;
    }

    // A transfer will create a positive and negative transaction. Filter out the negative ones.
    if (transfer.transaction.amount <= 0) {
      continue;
    }

    // If it's a one-time transfer, just add it to the filtered list.
    if (!transfer.recurringTransfer) {
      filtered.push(transfer);
      continue;
    }

    const key = transfer.recurringTransfer.id;
    const item = summary.get(key);

    const transactedAt = transfer.transaction.transactedAt;

    if (!item) {
      filtered.push({ ...transfer, transaction: { ...transfer.transaction } });
      const idx = filtered.length - 1;
      summary.set(key, {
        index: idx,
        seenMonths: new Set([`${transactedAt.year}-${transactedAt.month}`]),
        transactions: new Map([[transfer.transaction.id, transfer]]),
      });
    } else {
      filtered[item.index].transaction!.amount += transfer.transaction.amount;
      item.seenMonths.add(`${transactedAt.year}-${transactedAt.month}`);
      item.transactions.set(transfer.transaction.id, transfer);
    }
  }

  for (const [, item] of summary) {
    const { index, seenMonths, transactions } = item;
    const transferRow = filtered[index];

    const currentDate = DateTime.local().startOf('day');
    const start = transferRow.recurringTransfer?.recurringStart.startOf('day');
    const end = DateTime.min(
      (transferRow.recurringTransfer?.recurringEnd ?? currentDate).startOf(
        'day',
      ),
      currentDate,
    );

    if (!start) {
      continue;
    }

    transferRow.missingMonths = [];

    let current = start;
    while (current <= end) {
      const key = `${current.year}-${current.month}`;
      if (!seenMonths.has(key)) {
        transferRow.missingMonths.push(current);
      }
      current = current.plus({ months: 1 });
    }

    transferRow.failedCount = transferRow.missingMonths.length;
    transferRow.summarizedTransfers = transactions;
  }

  return { filtered, upcoming };
}
