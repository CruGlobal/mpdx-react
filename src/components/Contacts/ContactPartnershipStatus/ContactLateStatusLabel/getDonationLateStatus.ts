import { DateTime } from 'luxon';

export enum ContactLateStatusEnum {
  OnTime,
  LateLessThirty,
  LateMoreThirty,
  LateMoreSixty,
}

const selectLaterDate = (
  lateAt?: string | null,
  pledgeStartDate?: string | null,
): string | null => {
  if (lateAt && !pledgeStartDate) {
    return lateAt;
  } else if (!lateAt && pledgeStartDate) {
    return pledgeStartDate;
  }

  if (lateAt && pledgeStartDate) {
    return lateAt > pledgeStartDate ? lateAt : pledgeStartDate;
  }
  return null;
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
  pledgeFrequency?: string | null,
): ContactLateStatusEnum | undefined => {
  // Determine which date to use
  if (!lateAt && !pledgeStartDate) {
    return undefined;
  }

  // If pledgeFrequency is not provided, we cannot determine late status
  // e.g. for one time gifts
  if (!lateAt && pledgeStartDate && !pledgeFrequency) {
    return undefined;
  }

  // If lateAt is provided and is in the future, return OnTime
  if (lateAt && DateTime.fromISO(lateAt) > DateTime.now()) {
    return ContactLateStatusEnum.OnTime;
  }

  const laterDate = selectLaterDate(lateAt, pledgeStartDate);

  if (!laterDate) {
    return undefined;
  }

  const daysDiff = DateTime.now().diff(
    DateTime.fromISO(laterDate),
    'days',
  ).days;

  return getStatusFromDays(daysDiff);
};
