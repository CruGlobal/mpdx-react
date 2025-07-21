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
    let lateAt = '2020-01-06';
    expect(getDonationLateStatus(lateAt, null)).toEqual(
      ContactLateStatusEnum.OnTime,
    );

    lateAt = '2019-12-22';
    expect(getDonationLateStatus(lateAt, null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );

    lateAt = '2019-12-01';
    expect(getDonationLateStatus(lateAt, null)).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );

    lateAt = '2019-11-01';
    expect(getDonationLateStatus(lateAt, null)).toEqual(
      ContactLateStatusEnum.LateMoreSixty,
    );
  });

  it('uses pledgeStartDate when pledgeStartDate is later than lateAt', () => {
    const lateAt = '2019-09-01';
    const pledgeStartDate = '2019-12-22';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('uses lateAt when lateAt is later than pledgeStartDate', () => {
    const lateAt = '2019-12-22';
    const pledgeStartDate = '2019-09-01';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  // in cases of one time gifts and users don't define a give frequency
  it('returns undefined with pledgeStartDate only', () => {
    const pledgeStartDate = '2019-11-22';
    expect(getDonationLateStatus(null, pledgeStartDate, null)).toBeUndefined();
  });

  it('works with lateAt only', () => {
    const lateAt = '2019-12-22';
    expect(getDonationLateStatus(lateAt, null, null)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns undefined when both lateAt and pledgeStartDate are null', () => {
    expect(getDonationLateStatus(null, null)).toBeUndefined();
  });

  it('returns undefined when lateAt is null, pledgeFrequency is null, and pledgeStartDate is provided', () => {
    const pledgeStartDate = '2020-01-01';
    expect(getDonationLateStatus(null, pledgeStartDate, null)).toBeUndefined();
  });

  it('returns OnTime when lateAt is in the future', () => {
    const lateAt = '2020-01-17';
    const pledgeStartDate = '2019-12-17';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.OnTime,
    );
  });

  it('returns LateLessThirty when the days diff from the later date to now is less than 30', () => {
    const lateAt = '2020-01-01';
    const pledgeStartDate = '2019-12-01';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateLessThirty,
    );
  });

  it('returns LateMoreThirty when the days diff from the later date to now is between 30 and 60', () => {
    const lateAt = '2019-11-29';
    const pledgeStartDate = '2019-10-01';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateMoreThirty,
    );
  });

  it('returns LateMoreSixty when the days diff from the later date to now is more than 60', () => {
    const lateAt = '2019-05-01';
    const pledgeStartDate = '2019-10-01';
    expect(getDonationLateStatus(lateAt, pledgeStartDate)).toEqual(
      ContactLateStatusEnum.LateMoreSixty,
    );
  });
});
