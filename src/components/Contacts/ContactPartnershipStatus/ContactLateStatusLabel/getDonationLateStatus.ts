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

const getStatusFromDays = (daysDiff: number): ContactLateStatusEnum => {
  if (daysDiff < 0) {
    return ContactLateStatusEnum.OnTime;
  }
  if (daysDiff < 30) {
    return ContactLateStatusEnum.LateLessThirty;
  }
  if (daysDiff <= 60) {
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
  lateAt?: string | null,
  pledgeStartDate?: string | null,
): ContactLateStatusEnum | undefined => {
  if (!lateAt && !pledgeStartDate) {
    return undefined;
  }

  // If lateAt is provided and is in the future, return OnTime
  if (lateAt && DateTime.fromISO(lateAt) > DateTime.now()) {
    return ContactLateStatusEnum.OnTime;
  }

  let laterDate: string;
  if (lateAt && pledgeStartDate) {
    laterDate = selectLaterDate(lateAt, pledgeStartDate);
  } else {
    laterDate = lateAt || pledgeStartDate!;
  }

  if (!laterDate) {
    return undefined;
  }

  const daysSinceDate = DateTime.now().diff(
    DateTime.fromISO(laterDate),
    'days',
  ).days;

  return getStatusFromDays(Math.floor(daysSinceDate));
};
