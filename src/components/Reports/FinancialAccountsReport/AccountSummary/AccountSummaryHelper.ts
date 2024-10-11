import { DateTime } from 'luxon';

interface CreateFiltersProps {
  accountListId: string;
  financialAccountId: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}
interface Filters {
  dateRange?: {
    min?: string;
    max?: string;
  };
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  months: {
    amount: number;
    startDate: string;
    endDate: string;
  }[];
}

export const oneYearAgoDate = DateTime.local()
  .minus({ years: 1 })
  .plus({ days: 1 })
  .toISODate();
export const todaysDate = DateTime.local().toISODate();

export const createTransactionsUrl = ({
  accountListId,
  financialAccountId,
  startDate,
  endDate,
  categoryId,
}: CreateFiltersProps) => {
  const transactionsUrl = `/accountLists/${accountListId}/reports/financialAccounts/${financialAccountId}/transactions`;
  if (!startDate && !endDate && !categoryId) {
    return transactionsUrl;
  }

  const filters: Filters = {};
  if (startDate && endDate) {
    filters['dateRange'] = { min: startDate, max: endDate };
  }
  if (categoryId) {
    filters['categoryId'] = categoryId;
  }

  return `${transactionsUrl}?filters=${encodeURIComponent(
    JSON.stringify(filters),
  )}`;
};

export const formatNumber = (
  numberAsString?: string | number | null,
  makeAbsolute = true,
) => {
  const number =
    typeof numberAsString === 'string'
      ? Number(numberAsString)
      : numberAsString ?? 0;
  return Math.ceil(makeAbsolute ? Math.abs(number) : number);
};
