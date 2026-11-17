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

  /** The formatted amount the spouse who must reach their cap first needs to reach */
  otherCap: string;

  /** Whether the couple chose to split their combined cap by hand */
  manuallySplitCap: boolean;
}

const isOverCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  toCents(requestedYtdGross) > toCents(effectiveCap);

const isUnderCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  toCents(requestedYtdGross) < toCents(effectiveCap - AT_CAP_TOLERANCE);

/**
 * While the couple is under their combined cap, a spouse may go over their own cap only once the
 * other spouse has reached theirs. A couple over the combined cap goes to progressive approval
 * instead. The server refuses these requests, so they may not be submitted.
 */
export const useSpouseCapFirst = (): UseSpouseCapFirstResult => {
  const { calculation, hcmUser, hcmSpouse, editing } = useSalaryCalculator();
  const { combinedYtdGross } = useCaps();
  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const manuallySplitCap =
    !!calculation?.splitCapRequired && !!calculation.manuallySplitCap;
  const notBlocked = {
    blocked: false,
    overName: null,
    otherName: null,
    otherCap: '',
    manuallySplitCap,
  };

  // Submitted requests are only shown, so there is nothing to block
  if (!editing) {
    return notBlocked;
  }
  if (!calcs || !spouseCalcs) {
    return notBlocked;
  }
  // Wait for the names the message needs
  if (!hcmUser || !hcmSpouse) {
    return notBlocked;
  }
  // Like the server, skip the rule when it has no effective date or chosen caps to check against
  if (!calculation.effectiveDate) {
    return notBlocked;
  }
  const missingChosenCap =
    typeof calculation.salaryCap !== 'number' ||
    typeof calculation.spouseSalaryCap !== 'number';
  if (manuallySplitCap && missingChosenCap) {
    return notBlocked;
  }
  if (toCents(combinedYtdGross) > toCents(calcs.combinedCap)) {
    return notBlocked;
  }

  const user = { ...calcs, name: hcmUser.staffInfo.preferredName ?? null };
  const spouse = {
    ...spouseCalcs,
    name: hcmSpouse.staffInfo.preferredName ?? null,
  };
  const [over, other] = isOverCap(user) ? [user, spouse] : [spouse, user];
  if (!isOverCap(over) || !isUnderCap(other)) {
    return notBlocked;
  }

  // An automatic split gives each spouse half of the combined cap still unused, so the other
  // spouse's effective cap rises as they raise their salary. The amount that settles it is the
  // rest of the combined cap, limited by their own caps.
  const autoSplitCap = !!calculation.splitCapRequired && !manuallySplitCap;
  const otherTarget = autoSplitCap
    ? Math.min(
        other.personalFactorsCap,
        other.hardCap,
        calcs.combinedCap - over.requestedYtdGross,
      )
    : other.effectiveCap;

  return {
    blocked: true,
    overName: over.name,
    otherName: other.name,
    otherCap: formatCurrency(otherTarget),
    manuallySplitCap,
  };
};
