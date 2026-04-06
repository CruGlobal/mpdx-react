interface HcmMhaData {
  staffInfo: { country?: string | null };
  mhaEit: { mhaEligibility: boolean };
}

/*
 * isMhiUser checks if a user is based in Italy (MHI).
 * The API already returns mhaEligibility: false for Italy staff,
 * so this check is only needed for display purposes, to show
 * the MHI-specific message instead of the generic IBS message.
 */
export const isMhiUser = (hcmData?: HcmMhaData | null): boolean =>
  hcmData?.staffInfo.country === 'IT';

export const isEligibleForMha = (hcmData?: HcmMhaData | null): boolean =>
  hcmData?.mhaEit.mhaEligibility ?? false;
