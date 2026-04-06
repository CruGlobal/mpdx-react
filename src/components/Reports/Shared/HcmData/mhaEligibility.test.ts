import { isEligibleForMha, isMhiUser } from './mhaEligibility';

const eligible = (country = 'US') => ({
  staffInfo: { country },
  mhaEit: { mhaEligibility: true },
});

const ineligible = (country = 'US') => ({
  staffInfo: { country },
  mhaEit: { mhaEligibility: false },
});

describe('isMhiUser', () => {
  it('returns true for Italy', () => {
    expect(isMhiUser(ineligible('IT'))).toBe(true);
  });

  it('returns false for US', () => {
    expect(isMhiUser(eligible())).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isMhiUser(null)).toBe(false);
    expect(isMhiUser(undefined)).toBe(false);
  });
});

describe('isEligibleForMha', () => {
  it('returns true when mhaEligibility is true', () => {
    expect(isEligibleForMha(eligible())).toBe(true);
  });

  it('returns false when mhaEligibility is false', () => {
    expect(isEligibleForMha(ineligible())).toBe(false);
  });

  it('returns false for Italy staff (API returns ineligible)', () => {
    expect(isEligibleForMha(ineligible('IT'))).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isEligibleForMha(null)).toBe(false);
    expect(isEligibleForMha(undefined)).toBe(false);
  });
});
