import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

export const useFormData = () => {
  const { user, requestData } = useAdditionalSalaryRequest();
  const { currentSalaryCap, staffAccountBalance } =
    requestData?.latestAdditionalSalaryRequest?.calculations || {};
  const {
    emailAddress: email,
    preferredName: name,
    personNumber: accountNumber,
  } = user?.staffInfo || {};
  const grossSalaryAmount = user?.currentSalary?.grossSalaryAmount ?? 0;
  const primaryAccountBalance = staffAccountBalance ?? 0;
  const remainingAllowableSalary = (currentSalaryCap ?? 0) - grossSalaryAmount;

  return {
    email,
    name,
    accountNumber,
    primaryAccountBalance,
    remainingAllowableSalary,
  };
};
