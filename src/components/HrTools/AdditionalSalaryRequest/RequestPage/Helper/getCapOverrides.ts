import { TFunction } from 'i18next';

interface CapOverridesOptions {
  splitAsr: boolean;
  additionalApproval: boolean;
  exceedsCap: boolean;
  hasBoardCapException: boolean;
}

export const getCapOverrides = (
  {
    splitAsr,
    additionalApproval,
    exceedsCap,
    hasBoardCapException,
  }: CapOverridesOptions,
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

  if (additionalApproval || exceedsCap) {
    if (hasBoardCapException) {
      return {
        title: t(
          'Your request requires Board approval. Please review the information below to continue.',
        ),
        content: t(
          "You have a Board approved Maximum Allowable Salary (CAP) and your Additional Salary Request exceeds that amount. As a result we need to get their approval for this request. We'll forward your request to them and get back to you with their decision.",
        ),
      };
    }

    return {
      title: t(
        'Your request requires additional approval. Please fill in the information below to continue.',
      ),
      content: t(
        'Your request causes your Total Requested Salary to exceed your Maximum Allowable Salary.',
      ),
    };
  }

  return { title: undefined, content: undefined };
};
