import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

export const useFormUserInfo = () => {
  const { requestData, user } = useAdditionalSalaryRequest();
  const { staffAccountBalance } =
    requestData?.latestAdditionalSalaryRequest?.calculations || {};
  const {
    emailAddress: email,
    preferredName: name,
    personNumber: accountNumber,
  } = user?.staffInfo || {};
  const primaryAccountBalance = staffAccountBalance ?? 0;

  return {
    email,
    name,
    accountNumber,
    primaryAccountBalance,
  };
};
