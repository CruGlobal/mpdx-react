import { UserPersonTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useCaps } from './useCaps';

interface UseSosaBlockOverCapResult {
  /** Whether the user is a SOSA employee (Employee Staff Non-RMO Spouse) */
  isUserSosa: boolean;

  /** Whether the user is a SOSA employee whose saved gross exceeds their effective cap */
  blockOnCap: boolean;
}

/**
 * Determine whether a SOSA user's requested gross salary exceeds their
 * effective cap. Requests over their cap may not be submitted online.
 */
export const useSosaBlockOverCap = (): UseSosaBlockOverCapResult => {
  const { hcmUser } = useSalaryCalculator();
  const { overUserCap } = useCaps();

  const isUserSosa =
    hcmUser?.staffInfo.userPersonType ===
    UserPersonTypeEnum.EmployeeStaffNonRmoSpouse;
  const blockOnCap = isUserSosa && overUserCap;

  return { isUserSosa, blockOnCap };
};
