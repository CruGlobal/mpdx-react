import {
  getEffectiveEligibility,
  getHousingKind,
  getMhiEligibility,
} from './housingAllowance';

const italianHcm = {
  staffInfo: { country: 'IT' },
  mhaEit: { mhaEligibility: false },
  mhiEit: { mhiEligibility: true },
};
const usHcm = {
  staffInfo: { country: 'US' },
  mhaEit: { mhaEligibility: true },
  mhiEit: { mhiEligibility: false },
};

describe('getHousingKind', () => {
  it('returns MHI for Italy', () => {
    expect(getHousingKind('IT')).toBe('MHI');
  });

  it('returns MHA for everything else', () => {
    expect(getHousingKind('US')).toBe('MHA');
    expect(getHousingKind(null)).toBe('MHA');
  });
});

describe('getMhiEligibility', () => {
  it('is true when mhiEit.mhiEligibility is true', () => {
    expect(getMhiEligibility(italianHcm)).toBe(true);
  });

  it('is false when mhiEit.mhiEligibility is false or hcm is missing', () => {
    expect(getMhiEligibility(usHcm)).toBe(false);
    expect(getMhiEligibility(null)).toBe(false);
  });
});

describe('getEffectiveEligibility', () => {
  it('uses MHI flag for Italian staff', () => {
    expect(getEffectiveEligibility(italianHcm)).toBe(true);
  });

  it('uses MHA flag for non-Italian staff', () => {
    expect(getEffectiveEligibility(usHcm)).toBe(true);
    expect(
      getEffectiveEligibility({
        staffInfo: { country: 'US' },
        mhaEit: { mhaEligibility: false },
        mhiEit: { mhiEligibility: false },
      }),
    ).toBe(false);
  });

  it('returns false when hcm is null', () => {
    expect(getEffectiveEligibility(null)).toBe(false);
  });
});
