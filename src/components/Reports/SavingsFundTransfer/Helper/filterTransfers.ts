import { DateTime } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';

// index is the position of the summarized transfer in the filtered array
// seenMonths is a set of months that have been seen for the recurring transfer
// transactions is a map of transaction IDs to the original transaction objects
type Summary = {
  index: number;
  seenMonths: Set<string>;
  transactions: Map<string, Transactions>;
};

// Transfer history contains multiple transactions for recurring transfers.
// This hook summarizes those recurring transfers into a single transaction with the total amount.
// It also identifies any missed transfers and includes them as separate transactions with a failed status.
export function filteredTransfers(transfers: Transactions[]) {
  const filtered: Transactions[] = [];
  const summary = new Map<string, Summary>();

  for (const transfer of transfers) {
    // A transfer will create a positive and negative transaction. Filter out the negative ones.
    if (transfer.amount <= 0) {
      continue;
    }

    if (!transfer.recurringTransfer) {
      filtered.push(transfer);
      continue;
    }

    const key = transfer.recurringTransfer.id ?? '';
    let item = summary.get(key);

    const transactedAt = transfer.transactedAt;

    if (!item) {
      filtered.push({ ...transfer });
      const idx = filtered.length - 1;
      item = {
        index: idx,
        seenMonths: new Set([`${transactedAt.year}-${transactedAt.month}`]),
        transactions: new Map([[transfer.id, transfer]]),
      };
      summary.set(key, item);
    } else {
      filtered[item.index].amount += transfer.amount;
      item.seenMonths.add(`${transactedAt.year}-${transactedAt.month}`);
      item.transactions.set(transfer.id, transfer);
    }
  }

  for (const [, item] of summary) {
    const { index, seenMonths, transactions } = item;
    const transferRow = filtered[index];

    const currentDate = DateTime.local().startOf('day');
    const start = transferRow.recurringTransfer?.recurringStart?.startOf('day');
    const end = DateTime.min(
      (transferRow.recurringTransfer?.recurringEnd ?? currentDate).startOf(
        'day',
      ),
      currentDate,
    );

    if (!start) {
      continue;
    }

    const transferCount = transferRow.amount / transferRow.baseAmount;

    const monthsBetween = Math.floor(end.diff(start, 'months').months);
    const expectedCount = Math.max(0, monthsBetween + 1);

    if (transferCount < expectedCount) {
      transferRow.failedCount = expectedCount - transferCount;

      const missing: DateTime[] = [];

      let current = start;
      while (current <= end) {
        const key = `${current.year}-${current.month}`;
        if (!seenMonths.has(key)) {
          missing.push(current);
        }
        current = current.plus({ months: 1 });
      }

      transferRow.missingMonths = missing;
    } else {
      transferRow.failedCount = 0;
      transferRow.missingMonths = [];
    }

    transferRow.summarizedTransfers = transactions;
  }

  return filtered;
}
