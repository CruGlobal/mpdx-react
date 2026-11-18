import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { getNonBackpayTotal } from './Helper/getTotal';
import { useFormUserInfo } from './useFormUserInfo';

// Whether a request with this non-backpay total needs approval, by the API's approval threshold
export const exceedsApprovalThreshold = (
  threshold: number | null | undefined,
  nonBackpayTotal: number,
): boolean => typeof threshold === 'number' && nonBackpayTotal > threshold;

export const useNeedsApproval = (values: CompleteFormValues): boolean => {
  const { approvalThreshold } = useFormUserInfo();

  return exceedsApprovalThreshold(
    approvalThreshold?.amount,
    getNonBackpayTotal(values),
  );
};
