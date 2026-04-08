import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

export const useFormUserInfo = () => {
  const { calculations, user } = useAdditionalSalaryRequest();
  const { staffAccountBalance } = calculations || {};
  const {
    emailAddress: email,
    preferredName: name,
    personNumber: accountNumber,
  } = user?.staffInfo ?? {};
  const primaryAccountBalance = staffAccountBalance ?? 0;

  return {
    email,
    name,
    accountNumber,
    primaryAccountBalance,
  };
};
