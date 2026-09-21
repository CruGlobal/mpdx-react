import { DateTime } from 'luxon';
import { Transactions } from 'src/components/HrTools/SavingsFundTransfer/mockData';
import { monthsUntilOccurrenceOnOrAfter } from './monthsUntilOccurrenceOnOrAfter';

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
//
// historyStart is the start of the window the page requested the transfers for. Months before it
// have no rows even when they ran, so the missed-month scan must not begin before it (MPDX-10044).
export function filteredTransfers(
  transfers: Transactions[],
  historyStart: DateTime,
) {
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
      // Already filtered out non-existing transactions, so it is safe to assume the transaction is valid.
      filtered[item.index].transaction!.amount += transfer.transaction.amount;
      item.seenMonths.add(`${transactedAt.year}-${transactedAt.month}`);
      item.transactions.set(transfer.transaction.id, transfer);
    }
  }

  const currentDate = DateTime.local().startOf('day');
  const windowStart = historyStart.startOf('day');

  for (const [, item] of summary) {
    const { index, seenMonths, transactions } = item;
    const transferRow = filtered[index];

    const recurring = transferRow.recurringTransfer;
    const start = recurring?.recurringStart.startOf('day');
    const recurringEnd = recurring?.recurringEnd?.startOf('day') ?? null;
    let end: DateTime = DateTime.min(recurringEnd ?? currentDate, currentDate);

    // A transfer stopped before its end date creates no transactions after the
    // stop, so only look for missed months through its last actual transaction.
    const stoppedEarly =
      recurring?.active === false &&
      (!recurringEnd || recurringEnd > currentDate);
    if (stoppedEarly) {
      const lastTransactedAt = DateTime.max(
        ...[...transactions.values()].map((tx) => tx.transaction!.transactedAt),
      ).startOf('day');
      end = DateTime.min(end, lastTransactedAt);
    }

    // An invalid DateTime compares false against everything, which would keep the scan
    // below from ever failing its `current <= end` check, so bail out before it starts.
    if (!start?.isValid || !end.isValid || !windowStart.isValid) {
      continue;
    }

    transferRow.missingMonths = [];
    transferRow.historyTruncated = start < windowStart;

    // Add whole months to the start so an end-of-month day does not drift once clamped.
    let months = monthsUntilOccurrenceOnOrAfter(start, windowStart);
    let current = start.plus({ months });
    while (current <= end) {
      const key = `${current.year}-${current.month}`;
      if (!seenMonths.has(key)) {
        transferRow.missingMonths.push(current);
      }
      current = start.plus({ months: ++months });
    }

    transferRow.failedCount = transferRow.missingMonths.length;
    transferRow.summarizedTransfers = transactions;
  }

  return { filtered, upcoming };
}
