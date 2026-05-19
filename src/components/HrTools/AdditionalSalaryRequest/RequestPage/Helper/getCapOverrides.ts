import { TFunction } from 'i18next';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';

interface CapOverridesOptions {
  splitAsr: boolean;
  reason: ProgressiveApprovalTierReasonEnum | null | undefined;
}

export const getCapOverrides = (
  { splitAsr, reason }: CapOverridesOptions,
  t: TFunction,
) => {
  if (splitAsr) {
    return {
      title: t(
        'Your Total Additional Salary Request exceeds your remaining allowable salary.',
      ),
      content: t('Please make adjustments to your request to continue.'),
    };
  }

  if (!reason) {
    return { title: undefined, content: undefined };
  }

  if (reason === ProgressiveApprovalTierReasonEnum.BoardCapException) {
    return {
      title: t(
        'Your request requires Board approval. Please review the information below to continue.',
      ),
      content: t(
        "You have a Board approved Maximum Allowable Salary (CAP) and your Additional Salary Request exceeds that amount. As a result we need to get their approval for this request. We'll forward your request to them and get back to you with their decision.",
      ),
    };
  }

  if (reason === ProgressiveApprovalTierReasonEnum.OverlappingRequests) {
    return {
      title: t(
        'Your request requires additional approval. Please fill in the information below to continue.',
      ),
      content: t(
        'Your spouse has a pending Additional Salary Request or Salary Request, so this request needs additional approval.',
      ),
    };
  }

  const title = t(
    'Your request requires additional approval. Please fill in the information below to continue.',
  );

  if (reason === ProgressiveApprovalTierReasonEnum.OverCombinedCap) {
    return {
      title,
      content: t(
        'Your request causes your combined Total Requested Salary to exceed your combined Maximum Allowable Salary.',
      ),
    };
  }

  return {
    title,
    content: t(
      'Your request causes your Total Requested Salary to exceed your Maximum Allowable Salary.',
    ),
  };
};
