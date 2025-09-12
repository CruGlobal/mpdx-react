import { useMemo } from 'react';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';

export function useFilteredTransfers(transfers: Transactions[]) {
  return useMemo(() => {
    const filtered: Transactions[] = [];
    const recurring = new Map<string, number>();

    for (const transfer of transfers) {
      if (!transfer.recurringTransfer?.id) {
        filtered.push(transfer);
        continue;
      }

      const key = [
        transfer.transfer.sourceFundTypeName,
        transfer.transfer.destinationFundTypeName,
        transfer.subCategory.name,
        transfer.recurringTransfer?.id,
        transfer.recurringTransfer?.recurringStart,
        transfer.recurringTransfer?.recurringEnd,
      ].join('-');

      const index = recurring.get(key);
      if (index === undefined) {
        filtered.push({ ...transfer });
        recurring.set(key, filtered.length - 1);
      } else {
        const prev = filtered[index];
        filtered[index] = {
          ...prev,
          amount: prev.amount + transfer.amount,
        };
      }
    }

    return filtered;
  }, [transfers]);
}
