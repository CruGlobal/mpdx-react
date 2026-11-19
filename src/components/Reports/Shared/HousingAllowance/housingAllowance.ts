export type HousingKind = 'MHA' | 'MHI';

// Structural shape: both the shared HcmData query and SalaryCalculator's own
// Hcm query include these fields.
type HcmForMhi = {
  staffInfo: { country?: string | null };
  mhiEit: { mhiEligibility: boolean };
};

type HcmForBoardApproval = HcmForMhi & {
  mhaBoardApproval: { mhaEligibility: boolean };
};

// Italian staff apply for MHI; everyone else applies for MHA.
export const getHousingKind = (country: string | null): HousingKind =>
  country === 'IT' ? 'MHI' : 'MHA';

export const getMhiEligibility = (hcm: HcmForMhi | null): boolean =>
  hcm?.mhiEit.mhiEligibility ?? false;

// Whether someone has an MHA (or MHI) now. MHA rests on the board approval date
// (mhaBoardApproval), not on the IBS certification behind mhaEit, which only
// decides who may request a new MHA.
export const getBoardApprovalEligibility = (
  hcm: HcmForBoardApproval | null,
): boolean =>
  getHousingKind(hcm?.staffInfo.country ?? null) === 'MHI'
    ? getMhiEligibility(hcm)
    : (hcm?.mhaBoardApproval.mhaEligibility ?? false);
