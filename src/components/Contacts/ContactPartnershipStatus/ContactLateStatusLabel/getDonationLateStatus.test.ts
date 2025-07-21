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
    expect(getDonationLateStatus('2019-12-22', '2019-09-01')).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
    expect(getDonationLateStatus('2019-09-01', '2019-12-22')).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  // in cases of one time gifts and users don't define a give frequency
  it('returns undefined with pledgeStartDate only', () => {
    expect(getDonationLateStatus(null, '2019-11-22', null)).toEqual(undefined);
  });

  it('works with lateAt only', () => {
    expect(getDonationLateStatus('2019-12-22', null, null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns undefined when both lateAt and pledgeStartDate are null', () => {
    expect(getDonationLateStatus(null, null)).toBeUndefined();
  });

  it('returns undefined when lateAt is null, pledgeFrequency is null, and pledgeStartDate is provided', () => {
    expect(getDonationLateStatus(null, '2020-01-01', null)).toBeUndefined();
  });

  it('returns OnTime when lateAt is in the future', () => {
    expect(getDonationLateStatus('2020-01-17', '2019-12-17')).toEqual(
      ContactLateStatusEnum.OnTime,
    );
  });

  it('returns LateLessThirty when the days diff from the later date to now is less than 30', () => {
    expect(getDonationLateStatus('2020-01-01', '2019-12-01')).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns LateMoreThirty when the days diff from the later date to now is between 30 and 60', () => {
    expect(getDonationLateStatus('2019-11-29', '2019-10-01')).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );
  });

  it('returns LateMoreSixty when the days diff from the later date to now is more than 60', () => {
    expect(getDonationLateStatus('2019-05-01', '2019-10-01')).toEqual(
      ContactLateStatusEnum.LateMoreSixty,
    );
  });
});
