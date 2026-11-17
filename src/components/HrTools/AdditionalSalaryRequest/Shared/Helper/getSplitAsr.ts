import { toCents } from 'src/components/HrTools/SavingsFundTransfer/Helper/availableBalance';

// Tolerance for considering someone "at cap" — small rounding differences
// (e.g. $19,998 vs $20,000 cap) are treated as effectively at cap.
export const AT_CAP_TOLERANCE = 5;

export interface SplitAsrInput {
  /** `false` when the request is only current-year backpay, which does not count against the cap */
  addsToCap: boolean;
  /** User's salary for the year including outstanding ASRs and this ASR */
  requestedAnnualSalary: number;
  individualCap: number;
  /** Whether the spouse can get an ASR of their own */
  spouseCanSplit: boolean;
  /** Spouse's salary for the year including their outstanding ASRs */
  spouseRequestedAnnualSalary: number;
  /** `null` when there is no spouse or no spouse cap */
  spouseIndividualCap: number | null;
  /** `null` when the combined cap is unknown */
  combinedCap: number | null;
}

export interface SplitAsrResult {
  /** `true` when the request puts the user over their individual cap */
  exceedsCap: boolean;
  /** Which spouse must request up to their cap first, or null if no split */
  splitAsrType: 'user' | 'spouse' | null;
}

type SpouseCapStatus = 'under' | 'at' | 'over';

// Within $5 of cap but not over — treat as "at cap"
// e.g. an ASR of $19,998 with a cap of $20,000 is considered at cap
const getSpouseCapStatus = (
  spouseRequestedAnnualSalary: number,
  spouseIndividualCap: number | null,
): SpouseCapStatus => {
  if (spouseIndividualCap === null) {
    return 'under';
  }
  if (spouseRequestedAnnualSalary > spouseIndividualCap) {
    return 'over';
  }
  return spouseRequestedAnnualSalary >= spouseIndividualCap - AT_CAP_TOLERANCE
    ? 'at'
    : 'under';
};

const getSplitAsrType = (
  input: SplitAsrInput,
  exceedsCap: boolean,
): SplitAsrResult['splitAsrType'] => {
  const {
    addsToCap,
    requestedAnnualSalary,
    individualCap,
    spouseCanSplit,
    spouseRequestedAnnualSalary,
    spouseIndividualCap,
    combinedCap,
  } = input;
  if (!spouseCanSplit) {
    return null;
  }
  // A couple over the combined cap goes to the normal approval levels instead. Compare in cents,
  // as the server does.
  const combinedTotal = requestedAnnualSalary + spouseRequestedAnnualSalary;
  if (combinedCap !== null && toCents(combinedTotal) > toCents(combinedCap)) {
    return null;
  }

  const spouseStatus = getSpouseCapStatus(
    spouseRequestedAnnualSalary,
    spouseIndividualCap,
  );
  if (exceedsCap) {
    return spouseStatus === 'under' ? 'user' : null;
  }

  // Only show spouse split when user has room to increase (not at/over cap)
  const userHasRoom = requestedAnnualSalary < individualCap - AT_CAP_TOLERANCE;
  if (!addsToCap || !userHasRoom) {
    return null;
  }
  return spouseStatus === 'over' ? 'spouse' : null;
};

/**
 * While the couple is under their combined cap, a spouse may go over their own cap only once the
 * other spouse has reached theirs. A couple over the combined cap goes to the normal approval
 * levels instead.
 */
export const getSplitAsr = (input: SplitAsrInput): SplitAsrResult => {
  // Backpay does not count against the cap, so a request with nothing else in it
  // cannot exceed the cap or need splitting, even when the base salary is already over
  const exceedsCap =
    input.addsToCap && input.requestedAnnualSalary > input.individualCap;
  return { exceedsCap, splitAsrType: getSplitAsrType(input, exceedsCap) };
};
