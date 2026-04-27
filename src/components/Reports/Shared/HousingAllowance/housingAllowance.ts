export type HousingKind = 'MHA' | 'MHI';

// Structural shape: both the shared HcmData query and SalaryCalculator's own
// Hcm query include these fields.
type HcmForHousing = {
  staffInfo: { country?: string | null };
  mhaEit: { mhaEligibility: boolean };
  mhiEit: { mhiEligibility: boolean };
};

// Italian staff apply for MHI; everyone else applies for MHA.
export const getHousingKind = (country: string | null): HousingKind =>
  country === 'IT' ? 'MHI' : 'MHA';

export const getMhiEligibility = (hcm: HcmForHousing | null): boolean =>
  hcm?.mhiEit.mhiEligibility ?? false;

// The effective eligibility for whichever kind applies to this person.
export const getEffectiveEligibility = (hcm: HcmForHousing | null): boolean =>
  getHousingKind(hcm?.staffInfo.country ?? null) === 'MHI'
    ? getMhiEligibility(hcm)
    : (hcm?.mhaEit.mhaEligibility ?? false);
