import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

// Changed temporarily to test Submit Modal

export const useFormData = () => {
  const { requestData, user } = useAdditionalSalaryRequest();
  const { staffAccountBalance } =
    requestData?.latestAdditionalSalaryRequest?.calculations || {};
  const {
    emailAddress: email,
    preferredName: name,
    personNumber: accountNumber,
  } = user?.staffInfo || {};
  //const grossSalaryAmount = user?.currentSalary?.grossSalaryAmount ?? 0;
  const primaryAccountBalance = staffAccountBalance ?? 0;

  //const remainingAllowableSalary = (currentSalaryCap ?? 0) - grossSalaryAmount;
  const remainingAllowableSalary = 17500.0;

  return {
    email,
    name,
    accountNumber,
    primaryAccountBalance,
    remainingAllowableSalary,
  };
};
