import { DateTime } from 'luxon';
import { StatusEnum, Transactions } from '../mockData';

export function getStatusLabel(history: Transactions): StatusEnum {
  if (!history.recurringTransfer?.id) {
    return StatusEnum.Complete;
  }

  const { recurringEnd, active } = history.recurringTransfer;
  const today = DateTime.now().endOf('day');

  if (recurringEnd && recurringEnd <= today) {
    return StatusEnum.Ended;
  }

  // An inactive recurring transfer that hasn't reached its end date was
  // stopped manually rather than running its course.
  return active ? StatusEnum.Ongoing : StatusEnum.Stopped;
}
