import { AT_CAP_TOLERANCE } from 'src/components/HrTools/AdditionalSalaryRequest/Shared/Helper/getSplitAsr';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

interface PersonCaps {
  requestedYtdGross: number;
  effectiveCap: number;
}

interface UseSpouseCapFirstResult {
  /** Whether the request is refused until the other spouse reaches their cap */
  blocked: boolean;

  /** The name of the spouse whose salary is over their effective cap */
  overName: string | null;

  /** The name of the spouse who must reach their cap first */
  otherName: string | null;

  /** The formatted effective cap of the spouse who must reach their cap first */
  otherCap: string;

  /** Whether the couple chose to split their combined cap by hand */
  manuallySplitCap: boolean;
}

// The server compares in cents, so do the same to agree with it on the boundaries
const cents = (amount: number) => Math.round(amount * 100);

const isOverCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  cents(requestedYtdGross) > cents(effectiveCap);

const isUnderCap = ({ requestedYtdGross, effectiveCap }: PersonCaps) =>
  cents(requestedYtdGross) < cents(effectiveCap - AT_CAP_TOLERANCE);

/**
 * While the couple is under their combined cap, a spouse may go over their own cap only once the
 * other spouse has reached theirs. A couple over the combined cap goes to progressive approval
 * instead. The server refuses these requests, so they may not be submitted.
 */
export const useSpouseCapFirst = (): UseSpouseCapFirstResult => {
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
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

  if (!calcs || !spouseCalcs) {
    return notBlocked;
  }
  if (typeof calcs.combinedCap !== 'number') {
    return notBlocked;
  }

  const combinedYtdGross =
    calcs.requestedYtdGross + spouseCalcs.requestedYtdGross;
  if (cents(combinedYtdGross) > cents(calcs.combinedCap)) {
    return notBlocked;
  }

  const user = { ...calcs, name: hcmUser?.staffInfo.preferredName ?? null };
  const spouse = {
    ...spouseCalcs,
    name: hcmSpouse?.staffInfo.preferredName ?? null,
  };
  const [over, other] = isOverCap(user) ? [user, spouse] : [spouse, user];
  if (!isOverCap(over) || !isUnderCap(other)) {
    return notBlocked;
  }

  return {
    blocked: true,
    overName: over.name,
    otherName: other.name,
    otherCap: formatCurrency(other.effectiveCap),
    manuallySplitCap,
  };
};
