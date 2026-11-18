import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { getNonBackpayTotal } from './Helper/getTotal';
import { useFormUserInfo } from './useFormUserInfo';

// Whether a request with this non-backpay total needs approval, by the API's approval threshold. The total is
// rounded to cents first, so float error in summing the fields never puts a request of exactly the threshold over it.
export const exceedsApprovalThreshold = (
  threshold: number | null | undefined,
  nonBackpayTotal: number,
): boolean =>
  typeof threshold === 'number' &&
  Math.round(nonBackpayTotal * 100) / 100 > threshold;

export const useNeedsApproval = (values: CompleteFormValues): boolean => {
  const { approvalThreshold } = useFormUserInfo();

  return exceedsApprovalThreshold(
    approvalThreshold?.amount,
    getNonBackpayTotal(values),
  );
};
