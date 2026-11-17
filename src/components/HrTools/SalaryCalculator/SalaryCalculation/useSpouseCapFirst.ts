import { AT_CAP_TOLERANCE } from 'src/components/HrTools/AdditionalSalaryRequest/Shared/Helper/getSplitAsr';
import { toCents } from 'src/components/HrTools/SavingsFundTransfer/Helper/availableBalance';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { SalaryRequestCalculations } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useCaps } from './useCaps';

type PersonCaps = Pick<
  SalaryRequestCalculations,
  'requestedYtdGross' | 'effectiveCap' | 'personalFactorsCap' | 'hardCap'
>;

interface UseSpouseCapFirstResult {
  /** Whether the request is refused until the other spouse reaches their cap */
  blocked: boolean;

  /** The name of the spouse whose salary is over their effective cap */
  overName: string | null;

  /** The name of the spouse who must reach their cap first */
  otherName: string | null;

  /** The formatted gross salary that brings the spouse who must reach their cap first up to it */
  otherCap: string;

  /** Whether the couple chose to split their combined cap by hand */
  manuallySplitCap: boolean;

  /**
   * Whether the other spouse's effective cap goes up as they raise their salary, because an
   * automatic split gives them half of each raise until they reach their own cap
   */
  otherCapRises: boolean;
}

const isOverCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  toCents(requestedYtdGross) > toCents(effectiveCap);

const isUnderCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  toCents(requestedYtdGross) < toCents(effectiveCap - AT_CAP_TOLERANCE);

// More than $5 over what HCM pays today, so rounding an unchanged salary is not a raise
const isRaise = ({
  requestedGross,
  currentGross,
}: {
  requestedGross: number;
  currentGross: number;
}) => toCents(requestedGross) > toCents(currentGross + AT_CAP_TOLERANCE);

type Calculation = NonNullable<
  ReturnType<typeof useSalaryCalculator>['calculation']
>;
type HcmPerson = NonNullable<ReturnType<typeof useSalaryCalculator>['hcmUser']>;
type Person = ReturnType<typeof toPerson>;

const toPerson = (calcs: Calculation['calculations'], hcm: HcmPerson) => ({
  ...calcs,
  name: hcm.staffInfo.preferredName ?? null,
  currentGross: hcm.currentSalary.grossSalaryAmount ?? 0,
});

// Like the server, skip the rule when it has no effective date or chosen caps to check against
const missingServerInputs = (
  calculation: Calculation,
  manuallySplitCap: boolean,
) => {
  if (!calculation.effectiveDate) {
    return true;
  }
  const missingChosenCap =
    typeof calculation.salaryCap !== 'number' ||
    typeof calculation.spouseSalaryCap !== 'number';
  return manuallySplitCap && missingChosenCap;
};

/** The spouse asking to go over their cap and the spouse who must reach theirs first, if any */
const findOverAndOther = (
  user: Person,
  spouse: Person,
): [Person, Person] | null => {
  const [over, other] = isOverCap(user) ? [user, spouse] : [spouse, user];
  if (!isOverCap(over) || !isUnderCap(other)) {
    return null;
  }
  // Keeping or cutting a salary that is already over the cap, such as from earlier ASRs, is not
  // asking for more, so it follows the normal approval levels
  return isRaise(over) ? [over, other] : null;
};

// An automatic split gives each spouse half of their combined cap still unused (the server's
// chosen_cap), so the other spouse's effective cap rises as they raise their salary, up to their own
// caps (effective_cap). It meets their salary at the rest of their own combined cap. When the request
// owner's combined cap is lower, the couple passing it also lifts the block, but this amount is still
// where the other spouse reaches their own cap.
const getOtherCap = (autoSplitCap: boolean, over: Person, other: Person) => {
  if (!autoSplitCap) {
    return other.effectiveCap;
  }
  return Math.min(
    other.personalFactorsCap,
    other.hardCap,
    other.combinedCap - over.requestedYtdGross,
  );
};

// The cap counts this year's ASRs, so the other spouse's gross salary only has to make up the rest
const getOtherTarget = (otherCap: number, other: Person) =>
  otherCap - (other.requestedYtdGross - other.requestedGross);

/**
 * While the couple is under their combined cap, a raise may take a spouse over their own cap only
 * once the other spouse has reached theirs. A couple over the combined cap goes to progressive
 * approval instead. The server refuses these requests, so they may not be submitted.
 */
export const useSpouseCapFirst = (): UseSpouseCapFirstResult => {
  const { calculation, hcmUser, hcmSpouse, editing } = useSalaryCalculator();
  const { combinedYtdGross } = useCaps();
  const { formatCurrency } = useFormatters();

  const manuallySplitCap =
    !!calculation?.splitCapRequired && !!calculation.manuallySplitCap;
  const autoSplitCap =
    !!calculation?.splitCapRequired && !calculation.manuallySplitCap;
  const notBlocked = {
    blocked: false,
    overName: null,
    otherName: null,
    otherCap: '',
    manuallySplitCap,
    otherCapRises: false,
  };

  // Submitted requests are only shown, so there is nothing to block
  if (!editing || !calculation?.spouseCalculations) {
    return notBlocked;
  }
  // Wait for the names the message needs
  if (!hcmUser || !hcmSpouse) {
    return notBlocked;
  }
  if (missingServerInputs(calculation, manuallySplitCap)) {
    return notBlocked;
  }
  const { combinedCap } = calculation.calculations;
  if (toCents(combinedYtdGross) > toCents(combinedCap)) {
    return notBlocked;
  }

  const overAndOther = findOverAndOther(
    toPerson(calculation.calculations, hcmUser),
    toPerson(calculation.spouseCalculations, hcmSpouse),
  );
  if (!overAndOther) {
    return notBlocked;
  }
  const [over, other] = overAndOther;
  const otherCap = getOtherCap(autoSplitCap, over, other);

  return {
    blocked: true,
    overName: over.name,
    otherName: other.name,
    otherCap: formatCurrency(getOtherTarget(otherCap, other)),
    manuallySplitCap,
    otherCapRises: toCents(other.effectiveCap) < toCents(otherCap),
  };
};
