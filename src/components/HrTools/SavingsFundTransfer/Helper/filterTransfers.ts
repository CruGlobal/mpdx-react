import { DateTime } from 'luxon';
import { Transactions } from 'src/components/HrTools/SavingsFundTransfer/mockData';

// index is the position of the summarized transfer in the filtered array
// transactions is a map of transaction IDs to the original transaction objects
interface Summary {
  index: number;
  transactions: Map<string, Transactions>;
}

// Collapses each recurring transfer into one history row with its total and SAA-reported failures.
// historyStart is the start of the requested window; recurring transfers that began earlier are flagged as truncated.
export function filteredTransfers(
  transfers: Transactions[],
  historyStart: DateTime,
) {
  const filtered: Transactions[] = [];
  const upcoming: Transactions[] = [];
  const summary = new Map<string, Summary>();

  for (const transfer of transfers) {
    const { transaction, recurringTransfer } = transfer;

    if (!transaction) {
      // A recurring transfer that only failed in the window has no transaction but belongs in history.
      if (!recurringTransfer?.failures.length) {
        upcoming.push(transfer);
        continue;
      }
    } else if (transaction.amount <= 0) {
      // A transfer will create a positive and negative transaction. Filter out the negative ones.
      continue;
    }

    if (!recurringTransfer) {
      filtered.push(transfer);
      continue;
    }

    let item = summary.get(recurringTransfer.id);
    if (!item) {
      filtered.push({ ...transfer, transaction: null });
      item = { index: filtered.length - 1, transactions: new Map() };
      summary.set(recurringTransfer.id, item);
    }

    if (transaction) {
      const row = filtered[item.index];
      row.transaction = row.transaction
        ? {
            ...row.transaction,
            amount: row.transaction.amount + transaction.amount,
          }
        : { ...transaction };
      item.transactions.set(transaction.id, transfer);
    }
  }

  const windowStart = historyStart.startOf('day');

  for (const [, { index, transactions }] of summary) {
    const transferRow = filtered[index];
    const recurring = transferRow.recurringTransfer;

    transferRow.historyTruncated =
      !!recurring && recurring.recurringStart.startOf('day') < windowStart;
    transferRow.summarizedTransfers = transactions;
  }

  return { filtered, upcoming };
}
