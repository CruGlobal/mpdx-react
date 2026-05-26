import { DateTime } from 'luxon';

interface DateWindow {
  startDate?: DateTime | null;
  endDate?: DateTime | null;
}

export const getStaffExpenseMonthRange = (
  filters: DateWindow | null | undefined,
  baseTime: DateTime,
): { startMonth: string | null; endMonth: string | null } => {
  const endMonthFallback = filters?.startDate
    ? DateTime.now().endOf('month')
    : baseTime.endOf('month');

  return {
    startMonth:
      filters?.startDate?.startOf('month').toISODate() ??
      filters?.endDate?.startOf('month').toISODate() ??
      baseTime.startOf('month').toISODate(),
    endMonth:
      filters?.endDate?.endOf('month').toISODate() ??
      endMonthFallback.toISODate(),
  };
};
