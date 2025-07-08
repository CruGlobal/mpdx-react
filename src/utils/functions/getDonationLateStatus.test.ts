import { DateTime } from 'luxon';
import { ContactLateStatusEnum } from '../../components/Contacts/ContactPartnershipStatus/ContactLateStatusLabel/ContactLateStatusLabel';
import { getDonationLateStatus } from './getDonationLateStatus';

const mockNow = DateTime.fromISO('2025-06-15T12:00:00Z');
jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as DateTime<true>);

describe('getDonationLateStatus', () => {
  it('returns undefined when no dates provided', () => {
    expect(getDonationLateStatus(null, null)).toBeUndefined();
    expect(getDonationLateStatus(undefined, undefined)).toBeUndefined();
  });

  it('returns correct status based on days difference', () => {
    expect(getDonationLateStatus('2025-06-20T12:00:00Z', null)).toEqual(
      ContactLateStatusEnum.OnTime,
    );
    expect(getDonationLateStatus('2025-05-31T12:00:00Z', null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
    expect(getDonationLateStatus('2025-05-01T12:00:00Z', null)).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );
    expect(getDonationLateStatus('2025-03-17T12:00:00Z', null)).toEqual(
      ContactLateStatusEnum.LateMoreSixty,
    );
  });

  it('uses the later date when both are provided', () => {
    const lateAt = '2025-05-31T12:00:00Z';
    const pledgeStartDate = '2025-05-01T12:00:00Z';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('works with pledgeStartDate only', () => {
    expect(getDonationLateStatus(null, '2025-05-31T12:00:00Z')).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('works with lateAt only', () => {
    expect(getDonationLateStatus('2025-05-31T12:00:00Z', null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns OnTime for future dates', () => {
    expect(
      getDonationLateStatus('2025-07-20T12:00:00Z', '2025-07-15T12:00:00Z'),
    ).toEqual(ContactLateStatusEnum.OnTime);
  });
});
