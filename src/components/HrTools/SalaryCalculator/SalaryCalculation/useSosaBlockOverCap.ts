import { UserPersonTypeEnum } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

interface UseSosaBlockOverCapResult {
  /** Whether the user is a SOSA employee (Employee Staff Non-RMO Spouse) */
  isUserSosa: boolean;

  /** Whether the user is a SOSA employee whose saved year-to-date gross exceeds their hard cap */
  blockOnCap: boolean;
}

/**
 * Determine whether a SOSA user's requested year-to-date gross salary exceeds their hard cap.
 * SOSA requests over the effective cap but within the hard cap go to progressive approval like
 * anyone else's, but the server rejects requests over the hard cap, so they may not be submitted.
 */
export const useSosaBlockOverCap = (): UseSosaBlockOverCapResult => {
  const { hcmUser, calculation } = useSalaryCalculator();

  const isUserSosa =
    hcmUser?.staffInfo.userPersonType ===
    UserPersonTypeEnum.EmployeeStaffNonRmoSpouse;
  const calcs = calculation?.calculations;
  const overHardCap = !!calcs && calcs.requestedYtdGross > calcs.hardCap;
  const blockOnCap = isUserSosa && overHardCap;

  return { isUserSosa, blockOnCap };
};
