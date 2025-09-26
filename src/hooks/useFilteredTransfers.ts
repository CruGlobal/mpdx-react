import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';

// Transfer history contains multiple transactions for recurring transfers.
// This hook summarizes those recurring transfers into a single transaction with the total amount.
// It also identifies any missed transfers and includes them as separate transactions with a failed status.
export function useFilteredTransfers(
  transfers: Transactions[],
  today?: DateTime,
) {
  return useMemo(() => {
    const filtered: Transactions[] = [];
    const recurring = new Map<string, number>();
    const seenMonths = new Map<number, Set<DateTime>>();
    const summarized = new Map<number, Map<string, Transactions>>();

    for (const transfer of transfers) {
      if (transfer.amount <= 0) {
        continue;
      }

      if (!transfer.recurringTransfer) {
        filtered.push(transfer);
        continue;
      }

      const key = [transfer.recurringTransfer.id].join('-');

      const index = recurring.get(key);
      if (index === undefined) {
        filtered.push({ ...transfer });
        const idx = filtered.length - 1;
        recurring.set(key, idx);
        seenMonths.set(idx, new Set([transfer.transactedAt]));
        summarized.set(idx, new Map([[transfer.id, transfer]]));
      } else {
        filtered[index].amount += transfer.amount;
        seenMonths.get(index)?.add(transfer.transactedAt);
        summarized.get(index)?.set(transfer.id, transfer);
      }
    }

    for (const [, index] of recurring) {
      const transferRow = filtered[index];
      const currentDate = (today || DateTime.local()).startOf('day');
      const start =
        transferRow.recurringTransfer?.recurringStart?.startOf('day');
      const end = DateTime.min(
        (transferRow.recurringTransfer?.recurringEnd ?? currentDate).startOf(
          'day',
        ),
        currentDate,
      );

      const transferCount = transferRow.amount / transferRow.baseAmount;

      const expectedCount = () => {
        if (transferRow.recurringTransfer?.recurringEnd) {
          if (!start) {
            return 1;
          }
          return (end.year - start.year) * 12 + (end.month - start.month) + 1;
        } else {
          if (!start) {
            return 1;
          }
          return (end.year - start.year) * 12 + (end.month - start.month) + 1;
        }
      };

      if (transferCount < expectedCount()) {
        transferRow.failedCount = expectedCount() - transferCount;

        const seen = seenMonths.get(index);
        if (seen && start) {
          const monthsSeen = Array.from(seen);
          const missing: DateTime[] = [];

          let current = start;
          while (current <= end) {
            const found = monthsSeen.some((date) =>
              date.hasSame(current, 'month'),
            );
            if (!found) {
              missing.push(current);
            }
            current = current.plus({ months: 1 });
          }

          transferRow.missingMonths = missing;
        }
      }

      transferRow.summarizedTransfers = summarized.get(index) || null;
    }

    return filtered;
  }, [transfers]);
}
