import { DateTime } from 'luxon';

export enum ContactLateStatusEnum {
  OnTime,
  LateLessThirty,
  LateMoreThirty,
  LateMoreSixty,
}

const selectLaterDate = (lateAt: string, pledgeStartDate: string): string => {
  return lateAt > pledgeStartDate ? lateAt : pledgeStartDate;
};

const determineStatusFromDays = (daysDiff: number): ContactLateStatusEnum => {
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
};

/**
 * lateAt is determined by whether a donation has been received
 * within the expected time frame (Frequency window).
 * pledgeStartDate is the date the contact started their pledge.
 * Donations should only be late if the current date exceeds
 * pledgeStartDate + the frequency window.
 * Both are in ISO 8601 format (e.g., "2020-01-01").
 */
export const getDonationLateStatus = (
  lateAt?: string | null | undefined,
  pledgeStartDate?: string | null | undefined,
): ContactLateStatusEnum | undefined => {
  // Determine which date to use
  const laterDate =
    lateAt && pledgeStartDate
      ? selectLaterDate(lateAt, pledgeStartDate)
      : pledgeStartDate || lateAt;

  if (!laterDate) {
    return undefined;
  }

  const daysDiff = DateTime.now().diff(
    DateTime.fromISO(laterDate),
    'days',
  ).days;

  return determineStatusFromDays(daysDiff);
};
