export type HousingKind = 'MHA' | 'MHI';

// Structural shape: both the shared HcmData query and SalaryCalculator's own
// Hcm query include these fields.
type HcmForMhi = {
  staffInfo: { country?: string | null };
  mhiEit: { mhiEligibility: boolean };
};

type HcmForSalaryHousing = HcmForMhi & {
  mhaSalaryEit: { mhaEligibility: boolean };
};

// Italian staff apply for MHI; everyone else applies for MHA.
export const getHousingKind = (country: string | null): HousingKind =>
  country === 'IT' ? 'MHI' : 'MHA';

export const getMhiEligibility = (hcm: HcmForMhi | null): boolean =>
  hcm?.mhiEit.mhiEligibility ?? false;

// The Salary Calculator gates MHA on the board approval date (mhaSalaryEit),
// not on the IBS certification behind mhaEit that the MHA Request form uses.
export const getSalaryEffectiveEligibility = (
  hcm: HcmForSalaryHousing | null,
): boolean =>
  getHousingKind(hcm?.staffInfo.country ?? null) === 'MHI'
    ? getMhiEligibility(hcm)
    : (hcm?.mhaSalaryEit.mhaEligibility ?? false);
