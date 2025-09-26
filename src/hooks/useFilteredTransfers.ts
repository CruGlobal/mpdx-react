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
      } else {
        filtered[index].amount += transfer.amount;
        seenMonths.get(index)?.add(transfer.transactedAt);
      }
    }

    for (const [, index] of recurring) {
      const transfer = filtered[index];
      const currentDate = (today || DateTime.local()).startOf('month');
      const start =
        transfer.recurringTransfer?.recurringStart?.startOf('month');
      const end = DateTime.min(
        (transfer.recurringTransfer?.recurringEnd ?? currentDate).startOf(
          'month',
        ),
        currentDate,
      );

      const transferCount = transfer.amount / transfer.baseAmount;

      const expectedCount = () => {
        if (transfer.recurringTransfer?.recurringEnd) {
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
        transfer.failedCount = expectedCount() - transferCount;

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

          for (const missingDate of missing) {
            filtered.push({
              ...transfer,
              id: `${transfer.id}-missed-${missingDate.toFormat('yyyy-MM-dd')}`,
              amount: transfer.baseAmount,
              transactedAt: missingDate,
              failedStatus: true,
              failedCount: 0,
            });
          }
        }
      }
    }

    return filtered;
  }, [transfers]);
}
