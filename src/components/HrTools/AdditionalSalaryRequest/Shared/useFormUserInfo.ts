import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

export const useFormUserInfo = () => {
  const { requestData, user } = useAdditionalSalaryRequest();
  const calculations = requestData?.latestAdditionalSalaryRequest?.calculations;
  const {
    staffAccountBalance,
    availableStaffAccountBalance,
    remainingAllowableSalary,
  } = calculations || {};
  const { emailAddress: email, preferredName: name } = user?.staffInfo ?? {};
  const primaryAccountBalance = staffAccountBalance ?? 0;
  // The Primary balance plus its deficit limit, minus the household's other unpaid ASRs
  const availableAccountBalance = availableStaffAccountBalance ?? 0;
  const remainingCap = remainingAllowableSalary ?? 0;

  return {
    email,
    name,
    primaryAccountBalance,
    availableAccountBalance,
    remainingCap,
  };
};
