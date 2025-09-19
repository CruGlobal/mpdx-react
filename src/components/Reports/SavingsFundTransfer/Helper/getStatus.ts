import { DateTime } from 'luxon';
import { StatusEnum, Transactions } from '../mockData';

export function getStatusLabel(history: Transactions): StatusEnum {
  if (!history.recurringTransfer?.id) {
    return StatusEnum.Complete;
  }

  const endDate = history.recurringTransfer.recurringEnd;
  const today = DateTime.now().endOf('day');

  if (!endDate) {
    return StatusEnum.Ongoing;
  }

  return endDate > today ? StatusEnum.Ongoing : StatusEnum.Ended;
}
