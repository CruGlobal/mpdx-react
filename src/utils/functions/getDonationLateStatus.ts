import { DateTime } from 'luxon';

enum ContactLateStatusEnum {
  OnTime,
  LateLessThirty,
  LateMoreThirty,
  LateMoreSixty,
}

function selectLaterDate(lateAt: string, pledgeStartDate: string): string {
  const lateDate = DateTime.fromISO(lateAt);
  const pledgeDate = DateTime.fromISO(pledgeStartDate);
  return lateDate > pledgeDate ? lateAt : pledgeStartDate;
}

function determineStatusFromDays(daysDiff: number): ContactLateStatusEnum {
  if (daysDiff < 0) {
    return ContactLateStatusEnum.OnTime;
  }
  if (daysDiff < 30) {
    return ContactLateStatusEnum.LateLessThirty;
  }
  if (daysDiff < 60) {
    return ContactLateStatusEnum.LateMoreThirty;
  }
  return ContactLateStatusEnum.LateMoreSixty;
}

export function getDonationLateStatus(
  lateAt?: string | null,
  pledgeStartDate?: string | null,
): ContactLateStatusEnum | undefined {
  // Determine which date to use
  const dateToUse =
    lateAt && pledgeStartDate
      ? selectLaterDate(lateAt, pledgeStartDate)
      : pledgeStartDate || lateAt;

  if (!dateToUse) {
    return undefined;
  }

  const daysDiff = DateTime.now().diff(
    DateTime.fromISO(dateToUse),
    'days',
  ).days;

  return determineStatusFromDays(daysDiff);
}
