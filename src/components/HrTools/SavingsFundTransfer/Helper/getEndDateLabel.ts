import { dateFormat } from 'src/lib/intlFormat';
import { ScheduleEnum, StatusEnum, Transfers } from '../mockData';

// A recurring transfer with no end date runs until it is cancelled, which a
// blank cell would not distinguish from an end date we simply do not have.
// The CSV export is not localized, so callers supply the label.
export function getEndDateLabel(
  transfer: Transfers,
  locale: string,
  indefiniteLabel: string,
): string {
  const { schedule, status, active, endDate } = transfer;

  if (schedule !== ScheduleEnum.Monthly) {
    return '';
  }

  if (endDate?.isValid) {
    return dateFormat(endDate, locale);
  }

  // A stopped schedule has no future to be indefinite about.
  if (
    active === false ||
    status === StatusEnum.Ended ||
    status === StatusEnum.Stopped
  ) {
    return '';
  }

  return indefiniteLabel;
}
