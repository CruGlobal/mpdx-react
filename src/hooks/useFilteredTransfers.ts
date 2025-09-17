import { useMemo } from 'react';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';

// Transfer history contains multiple transactions for recurring transfers.
// This hook summarizes those recurring transfers into a single transaction with the total amount.
export function useFilteredTransfers(transfers: Transactions[]) {
  return useMemo(() => {
    const filtered: Transactions[] = [];
    const recurring = new Map<string, number>();

    for (const transfer of transfers) {
      if (transfer.amount <= 0) {
        continue;
      }

      if (!transfer.recurringTransfer?.id) {
        filtered.push(transfer);
        continue;
      }

      const key = [
        transfer.subCategory.name,
        transfer.recurringTransfer?.id,
      ].join('-');

      const index = recurring.get(key);
      if (index === undefined) {
        filtered.push({ ...transfer });
        recurring.set(key, filtered.length - 1);
      } else {
        filtered[index].amount += transfer.amount;
      }
    }

    return filtered;
  }, [transfers]);
}
