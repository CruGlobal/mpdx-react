import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const useApprovers = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse } = useSalaryCalculator();

  const approvers = [
    hcmUser?.exceptionSalaryCap?.exceptionApprover,
    hcmSpouse?.exceptionSalaryCap?.exceptionApprover,
  ].filter((approver) => !!approver);

  const approversFormatted =
    approvers.length === 2
      ? `${approvers[0]} ${t('and')} ${approvers[1]}`
      : approvers[0];

  return { approvers: approversFormatted };
};
