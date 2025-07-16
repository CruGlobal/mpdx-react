import {
  ContactLateStatusEnum,
  getDonationLateStatus,
} from './getDonationLateStatus';

describe('getDonationLateStatus', () => {
  it('returns undefined when no dates provided', () => {
    expect(getDonationLateStatus(null, null)).toBeUndefined();
    expect(getDonationLateStatus(undefined, undefined)).toBeUndefined();
  });

  it('returns correct status based on days difference', () => {
    expect(getDonationLateStatus('2020-01-06', null)).toEqual(
      ContactLateStatusEnum.OnTime,
    );
    expect(getDonationLateStatus('2019-12-22', null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
    expect(getDonationLateStatus('2019-12-01', null)).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );
    expect(getDonationLateStatus('2019-11-01', null)).toEqual(
      ContactLateStatusEnum.LateMoreSixty,
    );
  });

  it('uses the later date when both are provided', () => {
    const lateAt = '2019-12-22';
    const pledgeStartDate = '2019-12-01';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );
  });

  it('works with pledgeStartDate only', () => {
    expect(getDonationLateStatus(null, '2019-12-22')).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('works with lateAt only', () => {
    expect(getDonationLateStatus('2019-12-22', null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns OnTime for future dates', () => {
    expect(getDonationLateStatus('2020-02-01', '2020-01-15')).toEqual(
      ContactLateStatusEnum.OnTime,
    );
  });
});
