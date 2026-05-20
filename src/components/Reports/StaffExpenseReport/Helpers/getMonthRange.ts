import { DateTime } from 'luxon';

interface DateWindow {
  startDate?: DateTime | null;
  endDate?: DateTime | null;
}

export const getStaffExpenseMonthRange = (
  filters: DateWindow | null | undefined,
  baseTime: DateTime,
): { startMonth: string | null; endMonth: string | null } => ({
  startMonth:
    filters?.startDate?.startOf('month').toISODate() ??
    filters?.endDate?.startOf('month').toISODate() ??
    baseTime.startOf('month').toISODate(),
  endMonth:
    filters?.endDate?.endOf('month').toISODate() ??
    baseTime.endOf('month').toISODate(),
});
