import { TFunction } from 'i18next';

export const getCapOverrides = (
  splitCap: boolean,
  additionalApproval: boolean,
  exceedsCap: boolean,
  t: TFunction,
) => {
  if (splitCap) {
    return {
      title: t(
        'Your Total Additional Salary Request exceeds your remaining allowable salary.',
      ),
      content: t('Please make adjustments to your request to continue.'),
    };
  }

  if (additionalApproval || exceedsCap) {
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
