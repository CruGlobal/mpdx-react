import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import { DateRangeInput } from 'src/graphql/types.generated';

export enum ContactFilterChangedDuringEnum {
  Last3Months = 'Last3Months',
  Last6Months = 'Last6Months',
  Last12Months = 'Last12Months',
  Custom = 'Custom',
}

export const formatChangedDuringFilter = (
  changedDuring: ContactFilterChangedDuringEnum,
  t: TFunction,
): string => {
  const labels: Record<ContactFilterChangedDuringEnum, string> = {
    [ContactFilterChangedDuringEnum.Last3Months]: t('Last 3 Months'),
    [ContactFilterChangedDuringEnum.Last6Months]: t('Last 6 Months'),
    [ContactFilterChangedDuringEnum.Last12Months]: t('Last 12 Months'),
    [ContactFilterChangedDuringEnum.Custom]: t('Custom Date Range'),
  };
  return labels[changedDuring];
};

export interface DateRange {
  startDate: DateTime | null;
  endDate: DateTime | null;
}

const changedDuringMonths: Partial<
  Record<ContactFilterChangedDuringEnum, number>
> = {
  [ContactFilterChangedDuringEnum.Last3Months]: 3,
  [ContactFilterChangedDuringEnum.Last6Months]: 6,
  [ContactFilterChangedDuringEnum.Last12Months]: 12,
};

export const getChangedDuringRange = (
  changedDuring: ContactFilterChangedDuringEnum | null,
  customRange: DateRange | null,
): DateRange | null => {
  if (changedDuring === ContactFilterChangedDuringEnum.Custom) {
    return customRange;
  }
  const months = changedDuring && changedDuringMonths[changedDuring];
  if (!months) {
    return null;
  }
  const today = DateTime.now().startOf('day');
  return { startDate: today.minus({ months }), endDate: today };
};

export const toDateRangeInput = ({
  startDate,
  endDate,
}: DateRange): DateRangeInput => ({
  min: startDate?.toISODate(),
  max: endDate?.toISODate(),
});

export const fromDateRangeInput = ({
  min,
  max,
}: DateRangeInput): DateRange => ({
  startDate: min ? DateTime.fromISO(min) : null,
  endDate: max ? DateTime.fromISO(max) : null,
});

export const getChangedDuringOption = (
  range: DateRangeInput | null | undefined,
): ContactFilterChangedDuringEnum | null => {
  if (!range) {
    return null;
  }
  const today = DateTime.now().startOf('day');
  const preset = Object.values(ContactFilterChangedDuringEnum).find(
    (option) => {
      const months = changedDuringMonths[option];
      return (
        !!months &&
        range.min === today.minus({ months }).toISODate() &&
        range.max === today.toISODate()
      );
    },
  );
  return preset ?? ContactFilterChangedDuringEnum.Custom;
};
