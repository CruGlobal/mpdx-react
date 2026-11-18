import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { overBalanceMessage } from './overBalanceMessage';

export const useFormUserInfo = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData, user } = useAdditionalSalaryRequest();
  const calculations = requestData?.latestAdditionalSalaryRequest?.calculations;
  const {
    staffAccountBalance,
    staffAccountDeficitLimit,
    unpaidHouseholdAsrAmount,
    unpaidHouseholdAsrs,
    availableStaffAccountBalance,
    remainingAllowableSalary,
  } = calculations || {};
  const { emailAddress: email, preferredName: name } = user?.staffInfo ?? {};
  // The Primary balance plus its deficit limit, minus the household's other unpaid ASRs, all from SAA's own check
  const availableAccountBalance = availableStaffAccountBalance ?? 0;
  const balanceBreakdown = calculations
    ? {
        balance: staffAccountBalance ?? 0,
        deficitLimit: staffAccountDeficitLimit ?? 0,
        unpaidTotal: unpaidHouseholdAsrAmount ?? 0,
        unpaidRequests: unpaidHouseholdAsrs ?? [],
      }
    : null;
  const remainingCap = remainingAllowableSalary ?? null;

  return {
    email,
    name,
    availableAccountBalance,
    balanceBreakdown,
    overBalanceMessage: overBalanceMessage(t, locale, availableAccountBalance),
    remainingCap,
  };
};
