interface HcmMhaData {
  staffInfo: { country?: string | null };
  mhaEit: { mhaEligibility: boolean };
}

/*
 * We may want to consider making isMhiUser an API concern eventually,
 * but the current understanding is this is a temporary solution
 * until stakeholders determine how they want to handle MHI users.
 */
export const isMhiUser = (hcmData?: HcmMhaData | null): boolean =>
  hcmData?.staffInfo.country === 'IT';

export const isEligibleForMha = (hcmData?: HcmMhaData | null): boolean =>
  hcmData?.mhaEit.mhaEligibility ?? false;

export const isEligibleMhaUser = (hcmData?: HcmMhaData | null): boolean =>
  isEligibleForMha(hcmData) && !isMhiUser(hcmData);
